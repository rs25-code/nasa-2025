import sys
from pathlib import Path
from app.services.pdf_processor import PDFProcessor
from app.services.vector_store import VectorStore

def main():
    pdf_directory = "data/pdfs"
    
    if not Path(pdf_directory).exists():
        print(f"Error: Directory {pdf_directory} does not exist")
        print("Please create the directory and place your PDF files there")
        sys.exit(1)
    
    pdf_files = list(Path(pdf_directory).glob("*.pdf"))
    if not pdf_files:
        print(f"Error: No PDF files found in {pdf_directory}")
        sys.exit(1)
    
    print(f"Found {len(pdf_files)} PDF files to process")
    print("-" * 60)
    
    processor = PDFProcessor()
    print("Processing PDFs and extracting metadata...")
    papers_data = processor.process_all_pdfs(pdf_directory)
    
    print("-" * 60)
    print(f"Successfully processed {len(papers_data)} papers")
    print("Uploading to Pinecone...")
    
    vector_store = VectorStore()
    vector_store.upsert_papers(papers_data)
    
    print("-" * 60)
    print("✓ Ingestion complete!")
    print(f"Total papers processed: {len(papers_data)}")
    
    total_chunks = sum(len(chunks) for _, chunks in papers_data)
    print(f"Total chunks created: {total_chunks}")

if __name__ == "__main__":
    main()
