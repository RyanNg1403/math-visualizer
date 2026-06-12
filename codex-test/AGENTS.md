# Working agreement for this directory

You have an installed agent skill named **math-deck-video** (project skills dir: `../.codex/skills/math-deck-video/`; it may also be installed at `~/.codex/skills/math-deck-video/`). If skill discovery did not surface it, read its entry point directly: `../.codex/skills/math-deck-video/SKILL.md`.

Follow that playbook exactly for any visual-explainer task in this directory — it encodes the workflow, quality bar, reference implementations to copy from, and the known bugs to avoid. Read the reference files it points to at the moment each phase begins, and respect its phase-gate checklist (`references/checklist.md`): do not advance past a gate with unverified items.

Environment notes:
- Work entirely inside this directory. Do not modify sibling directories — they hold prior reference artifacts.
- Pick free ports for local servers (this run used 8200 for http.server and 9200 for vite).
- If no interactive browser automation is available, use Playwright (headed or new-headless) for both deck verification and driving the Motion Canvas editor render. The skill's references describe both.
- Requires: ffmpeg, node ≥ 22, python3 with numpy.
