#!/usr/bin/env python3
import os, sys, json, subprocess, requests

API_URL = "https://inference.dahl.global/v1/chat/completions"
MODEL = "moonshotai/Kimi-K2.6"
MAX_TOOL_ROUNDS = 10

def load_api_key():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    env_file = os.path.join(project_dir, ".env")
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip('"').strip("'")
                    if k == "DAHL_API_KEY":
                        return v
    return os.getenv("DAHL_API_KEY")

api_key = load_api_key()
if not api_key:
    print("Error: Set DAHL_API_KEY in .env or environment variable", file=sys.stderr)
    sys.exit(1)

PROJECT_DIR = os.path.realpath(os.path.dirname(os.path.abspath(__file__)))

def safe_path(user_path):
    resolved = os.path.realpath(os.path.join(PROJECT_DIR, user_path))
    if os.path.commonpath([resolved, PROJECT_DIR]) != PROJECT_DIR:
        return None
    return resolved

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read contents of a file in the project",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Relative path to file"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Create or overwrite a file in the project",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Relative path to file"},
                    "content": {"type": "string", "description": "Full file content to write"}
                },
                "required": ["path", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_dir",
            "description": "List files and directories in a project subdirectory",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Relative path (default: .)"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_command",
            "description": "Run a shell command inside the project directory",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {"type": "string", "description": "Shell command to execute"},
                    "cwd": {"type": "string", "description": "Working directory relative to project root (default: .)"}
                },
                "required": ["command"]
            }
        }
    }
]

SYSTEM_PROMPT = f"""You are a coding assistant. Project root: {PROJECT_DIR}. All file paths must stay within this directory. Path traversal is blocked.
Use the provided tools to read, write, list, and run commands. After tool results, continue or give your final answer. Be concise."""


def execute_tool(name, args):
    if name == "read_file":
        path = safe_path(args["path"])
        if path is None:
            return f"Access denied: {args['path']} is outside project directory"
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f"[file: {args['path']}]\n{f.read()[:6000]}"
        except Exception as e:
            return f"Error: {e}"

    elif name == "write_file":
        path = safe_path(args["path"])
        if path is None:
            return f"Access denied: {args['path']} is outside project directory"
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(args["content"])
            return f"Wrote {args['path']} ({len(args['content'])} bytes)"
        except Exception as e:
            return f"Error: {e}"

    elif name == "list_dir":
        path = safe_path(args.get("path", "."))
        if path is None:
            return f"Access denied: {args.get('path', '.')} is outside project directory"
        try:
            entries = os.listdir(path)
            lines = [e + ("/" if os.path.isdir(os.path.join(path, e)) else "") for e in sorted(entries)]
            return "\n".join(lines) if lines else "(empty)"
        except Exception as e:
            return f"Error: {e}"

    elif name == "run_command":
        cwd = safe_path(args.get("cwd", "."))
        if cwd is None:
            return f"Access denied: cwd {args.get('cwd', '.')} is outside project directory"
        try:
            proc = subprocess.run(
                args["command"], shell=True, cwd=cwd,
                capture_output=True, text=True, timeout=30
            )
            out = proc.stdout.strip()
            err = proc.stderr.strip()
            result = out
            if err:
                result += ("\n" if out else "") + err
            if proc.returncode != 0:
                result += f"\n(exit: {proc.returncode})"
            return result or "(no output)"
        except subprocess.TimeoutExpired:
            return "Command timed out (30s)"
        except Exception as e:
            return f"Error: {e}"

    return f"Unknown function: {name}"


def call_api(messages, tools=None):
    body = {"model": MODEL, "messages": messages}
    if tools:
        body["tools"] = tools
    resp = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=body,
        timeout=120
    )
    resp.raise_for_status()
    return resp.json()


# One-shot mode (args or pipe)
has_args = len(sys.argv) > 1
stdin_text = sys.stdin.read().strip() if not sys.stdin.isatty() else ""

if has_args or stdin_text:
    prompt = sys.argv[1] if has_args else "Explain this code"
    if stdin_text:
        prompt = f"{prompt}\n\n```\n{stdin_text}\n```"
    try:
        data = call_api([
            {"role": "system", "content": "You are a helpful coding assistant. Answer concisely."},
            {"role": "user", "content": prompt}
        ])
        print(data["choices"][0]["message"]["content"])
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    sys.exit(0)


# Interactive agent mode
print("=" * 60)
print("  Dahl AI Agent  |  Kimi-K2.6  |  /exit  |  /clear  |  \\ fuer mehrzeilig")
print("=" * 60)

history = [{"role": "system", "content": SYSTEM_PROMPT}]

def input_user():
    try:
        return input("\033[90mYou>\033[0m ").rstrip()
    except (EOFError, KeyboardInterrupt):
        print()
        return None

while True:
    first_line = input_user()
    if first_line is None:
        break
    if first_line == "":
        continue
    if first_line.lower() == "/exit":
        print("Tschuss!")
        break
    if first_line.lower() == "/clear":
        history = [{"role": "system", "content": SYSTEM_PROMPT}]
        print("  Kontext geloscht.")
        continue

    # Multiline: start with \ or /m, end with empty line or ;;
    if first_line in ("\\", "/m"):
        print("  (multiline — leere Zeile oder ;; zum Senden, Ctrl+C zum Abbrechen)")
        lines = []
        while True:
            try:
                line = input("... ").rstrip()
            except (EOFError, KeyboardInterrupt):
                print()
                lines = []
                break
            if line == "" or line == ";;":
                break
            if line.lower() == "/cancel":
                print("  abgebrochen.")
                lines = []
                break
            lines.append(line)
        user_input = "\n".join(lines) if lines else ""
        if not user_input:
            continue
    else:
        user_input = first_line

    # @file support
    for word in user_input.split():
        if word.startswith("@") and len(word) > 1:
            filepath = word[1:]
            path = safe_path(filepath)
            if path is None:
                continue
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                user_input = user_input.replace(word, f"[file: {filepath}]\n```\n{content[:4000]}\n```"[:8000])
            except FileNotFoundError:
                pass

    history.append({"role": "user", "content": user_input})

    # Agent loop with native function calling
    for _ in range(MAX_TOOL_ROUNDS):
        try:
            data = call_api(history, tools=TOOLS)
        except Exception as e:
            print(f"\033[91mError: {e}\033[0m")
            break

        msg = data["choices"][0]["message"]

        if msg.get("content"):
            print(f"\033[94mAI>\033[0m {msg['content'].strip()}")

        tool_calls = msg.get("tool_calls")
        if not tool_calls:
            history.append({"role": "assistant", "content": msg.get("content", "")})
            print("\033[90m--- fertig ---\033[0m")
            break

        # Execute tool calls
        history.append(msg)
        tool_results = []
        for tc in tool_calls:
            fn_name = tc["function"]["name"]
            fn_args = json.loads(tc["function"]["arguments"])
            result = execute_tool(fn_name, fn_args)
            print(f"  \033[33m[{fn_name}] {fn_args.get('path', fn_args.get('command', ''))}\033[0m")
            tool_results.append({"tool_call_id": tc["id"], "output": result})

        history.extend([
            {"role": "tool", "tool_call_id": tr["tool_call_id"], "content": tr["output"]}
            for tr in tool_results
        ])
    else:
        print("\033[91mMax tool rounds reached.\033[0m")
