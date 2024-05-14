import React, { useEffect, useState } from 'react';
import './firebase/firebaseConfig'
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore'
import './App.css';

function App() {
  type BooksType = {
    id: number,
    title: string,
    author: string,
    year: number | null,
    rating: number,
    isbn: string | null
  }

  const db = getFirestore()

  const [books, setBooks] = useState<Array<BooksType>>([])
  const [recommendedBook, setRecommendedBook] = useState<BooksType | null>(null)
  const [newBookTitle, setNewBookTitle] = useState('')
  const [newBookAuthors, setNewBookAuthors] = useState('')
  const [newBookYear, setNewBookYear] = useState('')
  const [newBookRating, setNewBookRating] = useState('')
  const [newBookISBN, setNewBookISBN] = useState('')
  const [groupingMode, setGroupingMode] = useState<'rating' | 'author'>('rating')
  const [selectedBook, setSelectedBook] = useState<BooksType | null>(null) // State selected book for edit

  // Connect firebase
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'books'))
      const temporaryArr: Array<BooksType> = []
      querySnapshot.forEach((doc) => {
        temporaryArr.push(doc.data() as BooksType)
      })
      setBooks(temporaryArr)
    }

    fetchData()
  }, [books])

  // Recommended book
  useEffect(() => {
    const goodBooks = books.filter((book) => book.year && book.year >= new Date().getFullYear() - 3);
    const bestBooks = goodBooks.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    const toRate = bestBooks.sort((a, b) => b.rating - a.rating)
    if (toRate[0]?.rating) {
      const maxRate = toRate[0].rating
      const filterBest = toRate.filter((book) => book.rating == maxRate)
      const recomendedBook = filterBest[Math.floor(Math.random() * filterBest.length)]
      setRecommendedBook(recomendedBook)
    }
  }, [books])

  // Filter years
  const years: (number | null)[] = [];
  books.forEach((book) => {
    if (!years.includes(book.year)) {
      years.push(book.year);
    }
  });

  const filteredYears = years.sort((a, b) => {
    return (b ?? 0) - (a ?? 0)
  })

  // Add book
  const addBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    let generateId = books.length > 0 ? Math.max(...books.map((book) => book.id)) + 1 : 1
    await setDoc(doc(db, 'books', generateId.toString()), {
      id: generateId,
      title: newBookTitle,
      author: newBookAuthors,
      year: newBookYear ? parseInt(newBookYear) : null,
      rating: newBookRating ? parseInt(newBookRating) : 0
    })
    setNewBookTitle('')
    setNewBookAuthors('')
    setNewBookYear('')
    setNewBookRating('')
    setNewBookISBN('')
  }

  // Remove book
  const deleteBook = async (id: number) => {
    await deleteDoc(doc(db, 'books', id.toString()))
  }

  // Edit book
  const editBook = async (book: BooksType) => {
    setSelectedBook(book);
    setNewBookTitle(book.title);
    setNewBookAuthors(book.author);
    setNewBookYear(book.year ? String(book.year) : '');
    setNewBookRating(String(book.rating));
    setNewBookISBN(book.isbn || '');
  }

  // Update book
  const updateBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedBook) return;
    await setDoc(doc(db, 'books', selectedBook.id.toString()), {
      ...selectedBook,
      title: newBookTitle,
      author: newBookAuthors,
      year: newBookYear ? parseInt(newBookYear) : null,
      rating: newBookRating ? parseInt(newBookRating) : 0,
      isbn: newBookISBN || null
    })
    setNewBookTitle('')
    setNewBookAuthors('')
    setNewBookYear('')
    setNewBookRating('')
    setNewBookISBN('')
    setSelectedBook(null); //  Clear selected book state after update
  }

  // Filtering books with year and without
  const booksWithoutYear = books.filter((book) => !book.year)
  const booksWithYear = books.filter((book) => book.year)

  // Toggle grouping method
  const toggleGroupingMode = () => {
    setGroupingMode(groupingMode === 'rating' ? 'author' : 'rating');
  }

  return (
    <div className="container">
      <div className="books">
        <ul>
          {/* Recommended book */}
          <li>{recommendedBook ? `---${recommendedBook.title}---` : ''}</li>

          {/* Books */}
          {groupingMode === 'rating' ? (
            // grouping by rating
            booksWithYear.length > 0 ?
            filteredYears.map(year => (
              <li key={year}>
                {year}
                <ul>
                  {booksWithYear
                    .filter(books => books.year === year)
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map(book => (
                      <li key={book.id}>
                        - {book.title}{' '}
                        <button onClick={() => deleteBook(book.id)}>Delete</button>{' '}
                        <button onClick={() => editBook(book)}>Edit</button>{' '}
                      </li>
                    ))}
                </ul>
              </li>
            ))
            :
            (
              <li>No books. Please add</li>
            )
          ) : (
            // grouping by author
            Array.from(new Set(books.map(book => book.author))).map(author => (
              <li key={author}>
                {author}
                <ul>
                  {books.filter(book => book.author === author)
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map(book => (
                      <li key={book.id}>
                        - {book.title}{' '}
                        <button onClick={() => deleteBook(book.id)}>Delete</button>{' '}
                        <button onClick={() => editBook(book)}>Edit</button>{' '}
                      </li>
                    ))}
                </ul>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Add book form */}
      <div className="add_book">
        <h4>{selectedBook ? 'Edit book' : 'Add book'}</h4> {/* Dynamically change form header */}
        <form onSubmit={selectedBook ? updateBook : addBook}> {/* Use updateBook if book is selected */}
          <label>
            <p>Название:</p>
            <input required maxLength={100} type="text" value={newBookTitle} onChange={(e) => { setNewBookTitle(e.currentTarget.value) }} />
          </label>
          <label>
            <p>Список авторов:</p>
            <input required type="text" value={newBookAuthors} onChange={(e) => { setNewBookAuthors(e.currentTarget.value) }} />
          </label>
          <label>
            <p>Год публикации:</p>
            <input min='1800' type="number" value={newBookYear} onChange={(e) => { setNewBookYear(e.currentTarget.value) }} />
          </label>
          <label>
            <p>Рейтинг:</p>
            <input min={0} max={10} type="number" value={newBookRating} onChange={(e) => { setNewBookRating(e.currentTarget.value) }} />
          </label>
          <label>
            <p>ISBN:</p>
            <input type="text" value={newBookISBN} placeholder='xxx-x-xxxx-xxxx-x' onChange={(e) => { setNewBookISBN(e.currentTarget.value) }} />
          </label>
          <input type="submit" value={selectedBook ? 'Save changes' : 'Add'} /> {/* Dynamically change submit button text */}
        </form>
      </div>

      {/* Toggle grouping mode button */}
      <button onClick={toggleGroupingMode}>
        Включить группировку: {groupingMode === 'rating' ? 'по автору' : 'по рейтингу'}
      </button>
    </div>
  );
}

export default App;
