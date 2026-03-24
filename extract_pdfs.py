import os
import PyPDF2

def extract_text_from_pdfs(pdf_dir, output_file):
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write("# PDF Extract Report\n\n")
        files = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]
        for file in files:
            filepath = os.path.join(pdf_dir, file)
            outfile.write(f"## File: {file}\n\n")
            try:
                with open(filepath, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for i, page in enumerate(reader.pages):
                        text = page.extract_text()
                        if text:
                            outfile.write(text + "\n")
            except Exception as e:
                outfile.write(f"Error reading file: {str(e)}\n")
            outfile.write("\n\n---\n\n")

if __name__ == '__main__':
    extract_text_from_pdfs(r'c:\Users\jamic\製造業分析', r'c:\Users\jamic\製造業分析\all_pdf_content.md')
