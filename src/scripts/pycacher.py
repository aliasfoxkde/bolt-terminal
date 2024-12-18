import os
import py_compile
import re

def clean_and_compile(src_folder, dest_folder):
    # Ensure destination folder exists
    os.makedirs(dest_folder, exist_ok=True)

    for root, dirs, files in os.walk(src_folder):
        for file in files:
            if file.endswith(".py"):
                src_path = os.path.join(root, file)
                dest_path = os.path.join(dest_folder, os.path.relpath(root, src_folder), file + "c")

                # Clean the file
                cleaned_code = clean_python_file(src_path)

                # Write cleaned code to a temporary file
                temp_path = src_path + ".temp"
                with open(temp_path, "w", encoding="utf-8") as temp_file:
                    temp_file.write(cleaned_code)

                # Compile the temporary file
                try:
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    py_compile.compile(temp_path, cfile=dest_path, doraise=True)
                    print(f"Compiled: {src_path} -> {dest_path}")
                except py_compile.PyCompileError as e:
                    print(f"Failed to compile {src_path}: {e}")
                finally:
                    # Remove the temporary file
                    os.remove(temp_path)

def clean_python_file(file_path):
    """
    Removes comments and excess whitespace from a Python file.
    """
    cleaned_lines = []
    with open(file_path, "r", encoding="utf-8") as file:
        for line in file:
            # Remove comments
            line = re.sub(r"#.*", "", line)

            # Remove excess whitespace
            line = line.strip()

            # Add cleaned line if it's not empty
            if line:
                cleaned_lines.append(line)

    # Join lines with a single newline
    return "\n".join(cleaned_lines)

# Example usage
src_folder = "python_stdlib"
dest_folder = "compiled_python_stdlib"
clean_and_compile(src_folder, dest_folder)
