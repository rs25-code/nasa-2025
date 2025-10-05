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
    
    # Check if user wants to reprocess (clear cache)
    reprocess = input("Clear cache and reprocess all PDFs? (y/N): ").lower() == 'y'
    if reprocess:
        cache_dir = Path("data/processed")
        if cache_dir.exists():
            for cache_file in cache_dir.glob("*.json"):
                cache_file.unlink()
            print("✓ Cache cleared")
    
    processor = PDFProcessor()
    print("\nProcessing PDFs with improved chunking strategy...")
    print("- Using sentence-aware chunking for semantic coherence")
    print("- Storing 2x more text in metadata for context")
    print("- Enhanced metadata extraction with more details")
    print("-" * 60)
    
    papers_data = processor.process_all_pdfs(pdf_directory)
    
    print("-" * 60)
    print(f"Successfully processed {len(papers_data)} papers")
    
    # Show statistics
    total_chunks = sum(len(chunks) for _, chunks in papers_data)
    avg_chunks = total_chunks / len(papers_data) if papers_data else 0
    
    print(f"Total chunks created: {total_chunks}")
    print(f"Average chunks per paper: {avg_chunks:.1f}")
    
    print("\nUploading to Pinecone...")
    vector_store = VectorStore()
    vector_store.upsert_papers(papers_data)
    
    print("-" * 60)
    print("✓ Ingestion complete with improved quality!")
    print(f"Total papers processed: {len(papers_data)}")
    print(f"Total chunks uploaded: {total_chunks}")
    print("\nExpected improvements:")
    print("  • Better semantic coherence in chunks")
    print("  • Richer context with 2x text storage")
    print("  • More comprehensive metadata")
    print("  • Higher search relevance scores (>0.7)")

if __name__ == "__main__":
    main()
