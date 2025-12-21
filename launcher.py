"""
dotFly App Launcher and Examples
Run standalone dotFly applications with manifest.json
"""

import sys
from pathlib import Path
from src.app_manager import AppBuilder, create_example_app
from src.app_runtime import launch_app, AppWindow
import json


def create_and_launch_example_app():
    """Create and launch the example app"""
    print("=" * 60)
    print("dotFly - Desktop Application Framework")
    print("=" * 60)
    print()
    
    # Create example app
    print("Creating example app structure...")
    app_path = create_example_app('.')
    print(f"✓ App created at: {app_path}")
    print()
    
    # Show manifest
    manifest_path = app_path / 'manifest.json'
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    print("App Manifest:")
    print(f"  Name: {manifest['name']}")
    print(f"  Version: {manifest['version']}")
    print(f"  Main Page: {manifest['main']}")
    print(f"  Pages: {', '.join(manifest['pages'].keys())}")
    print(f"  Databases: {', '.join([db['id'] for db in manifest['databases']])}")
    print()
    
    # Launch app
    print("Launching app in WebView...")
    print("(Window will open in a moment)")
    print()
    
    try:
        launch_app(str(app_path), port=8000)
    except Exception as e:
        print(f"Error: {e}")
        print()
        print("Make sure you have pywebview installed:")
        print("  pip install pywebview")


def launch_from_path(app_path: str):
    """Launch app from a given path"""
    app_path = Path(app_path)
    
    if not (app_path / 'manifest.json').exists():
        print(f"Error: No manifest.json found in {app_path}")
        sys.exit(1)
    
    try:
        print(f"Launching {app_path.name}...")
        launch_app(str(app_path), port=8000)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


def launch_program(app_path: str, program_id: str, port: int = 8000):
    """Launch a single program (from programs.json) as a temporary app.

    Usage:
      launcher.py program <app_path_or_demo_app> <program_id>
    If the first arg is omitted, `demo_app` is used.
    """
    src_root = Path(app_path)
    # locate programs.json
    prog_path = src_root / 'programs.json'
    if not prog_path.exists():
        prog_path = src_root / 'demo_app' / 'programs.json'

    if not prog_path.exists():
        print(f"Error: programs.json not found under {src_root} or demo_app")
        sys.exit(1)

    progs = json.loads(prog_path.read_text(encoding='utf-8')).get('programs', [])
    prog = next((p for p in progs if p.get('id') == program_id), None)
    if not prog:
        print(f"Error: program id '{program_id}' not found in {prog_path}")
        sys.exit(1)

    prog_rel = prog.get('path')
    if not prog_rel:
        print(f"Error: program entry for '{program_id}' has no path")
        sys.exit(1)

    # resolve program source file
    candidate = src_root / prog_rel
    if not candidate.exists():
        candidate = src_root / 'demo_app' / prog_rel

    if not candidate.exists():
        print(f"Error: program file not found: {prog_rel}")
        sys.exit(1)

    # create temp app dir
    tmp_root = Path('.tmp_runs')
    timestamp = int(time.time())
    out_dir = tmp_root / f"program_{program_id}_{timestamp}"
    pages_dir = out_dir / 'pages'
    assets_dir = out_dir / 'assets'
    data_dir = out_dir / 'data'
    out_dir.mkdir(parents=True, exist_ok=True)
    pages_dir.mkdir(parents=True, exist_ok=True)
    assets_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)

    # copy program into pages as index
    if candidate.suffix.lower() == '.json':
        shutil.copyfile(candidate, pages_dir / 'index.json')
        main_page = 'index'
    elif candidate.suffix.lower() == '.html':
        shutil.copyfile(candidate, pages_dir / 'index.html')
        main_page = 'index'
    else:
        # fallback: if it's in demo_app/assets, copy to assets and create index.html loader
        tgt = assets_dir / candidate.name
        shutil.copyfile(candidate, tgt)
        index_html = f"""<!doctype html>
<html>
<head><meta charset=\"utf-8\"><title>{program_id}</title></head>
<body>
<script src=\"/dotpipe.js\"></script>
<script src=\"/assets/{candidate.name}\"></script>
</body>
</html>
"""
        (pages_dir / 'index.html').write_text(index_html, encoding='utf-8')
        main_page = 'index'

    manifest = {
        'name': f'Program:{program_id}',
        'version': '1.0.0',
        'description': prog.get('description', ''),
        'main': main_page,
        'pages': { 'index': 'index.json' } if (pages_dir / 'index.json').exists() else { 'index': 'index.html' },
        'databases': [],
        'assets': [],
        'settings': {
            'window_width': 1000,
            'window_height': 700,
            'resizable': True
        }
    }

    with open(out_dir / 'manifest.json', 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)

    print(f'Created temporary app for program {program_id} at: {out_dir}')
    print('Launching...')
    launch_app(str(out_dir), port=port)


def create_blank_app(name: str, path: str = '.'):
    """Create a blank app with basic structure"""
    print(f"Creating blank app: {name}")
    app_path = AppBuilder.create_app(name, path, create_example=True)
    print(f"✓ App created at: {app_path}")
    print()
    print("App structure:")
    print(f"  {app_path}/")
    print(f"    manifest.json")
    print(f"    pages/")
    print(f"      index.json")
    print(f"    data/")
    print(f"    assets/")
    return app_path


if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == 'example':
            create_and_launch_example_app()
        elif command == 'create':
            if len(sys.argv) > 2:
                app_name = sys.argv[2]
                app_path = create_blank_app(app_name)
                print()
                print("To launch your app:")
                print(f"  python3launcher.py run {app_path}")
            else:
                print("Usage: python3launcher.py create <app_name>")
        elif command == 'run':
            if len(sys.argv) > 2:
                app_path = sys.argv[2]
                launch_from_path(app_path)
            else:
                print("Usage: python3launcher.py run <path_to_app>")
        elif command == 'program':
            # Usage: python3launcher.py program [app_path] <program_id>
            if len(sys.argv) == 3:
                # assume demo_app as source
                program_id = sys.argv[2]
                launch_program('demo_app', program_id)
            elif len(sys.argv) >= 4:
                app_path = sys.argv[2]
                program_id = sys.argv[3]
                launch_program(app_path, program_id)
            else:
                print("Usage: python3launcher.py program [app_path] <program_id>")
        else:
            print(f"Unknown command: {command}")
            print()
            print("Usage:")
            print("  python3launcher.py example          - Create and launch example app")
            print("  python3launcher.py create <name>    - Create blank app")
            print("  python3launcher.py run <path>       - Launch existing app")
            print("  python3launcher.py program [app_path] <program_id>  - Launch a single program from programs.json (defaults to demo_app)")
    else:
        print("=" * 60)
        print("dotFly Application Launcher")
        print("=" * 60)
        print()
        print("Usage:")
        print("  python3launcher.py example          - Create and launch example app")
        print("  python3launcher.py create <name>    - Create blank app")
        print("  python3launcher.py run <path>       - Launch existing app")
        print("  python3launcher.py program [app_path] <program_id>  - Launch a single program from programs.json (defaults to demo_app)")
        print()
        print("Examples:")
        print("  python3launcher.py example")
        print("  python3launcher.py create MyApp")
        print("  python3launcher.py run MyApp")
        print()
    
    # Note: run 'python3launcher.py program demo_app file_explorer' to open the file_explorer program
