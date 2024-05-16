const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {

  const submitForm = document.getElementById('form');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
    clearFormInputs(); // Menghapus bekas inputan lama ketika sudah klik 'submit'
  });

  const searchInput = document.getElementById('search-input');

  searchInput.addEventListener('input', function() {
    performSearch();
  });

  function performSearch() {
    const searchText = searchInput.value.toLowerCase();
    const filteredBooks = books.filter(function(book) {
      return book.title.toLowerCase().includes(searchText);
    });
    renderBooks(filteredBooks);
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function clearFormInputs() {
  document.getElementById('title').value = ''; // Menghapus nilai input judul buku
  document.getElementById('author').value = ''; // Menghapus nilai input nama penulis
  document.getElementById('year').value = ''; // Menghapus nilai input tahun terbit
  document.getElementById('complete-check').checked = false; // Menghapus cek pada checkbox
}

function addBook() {
  const textBook = document.getElementById('title').value;
  const textAuthor = document.getElementById('author').value;
  const year = document.getElementById('year').value;
  const checkButton = document.getElementById('complete-check').checked;
 
  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, textBook, textAuthor, year, checkButton);
  books.push(bookObject);
 
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}
 
function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
  const uncompletedBOOKList = document.getElementById('books');
  uncompletedBOOKList.innerHTML = '';

  const completedBOOKList = document.getElementById('completed-books');
  completedBOOKList.innerHTML = '';
 
  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('span');
  textAuthor.innerText = bookObject.author;
 
  const timeYear = document.createElement('h4');
  timeYear.innerText = bookObject.year;
 
  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, timeYear);
 
  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

 if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
 
    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(bookObject.id);
    });
 
    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
 
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });
 
    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    
    checkButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
 
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });
    
    container.append(checkButton, trashButton);
  }
  return container;
}

function addBookToCompleted (bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
 
  if (bookTarget === -1) return;
 
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
 
 
function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
 
  return -1;
}

function renderBooks(booksToRender) {
  const uncompletedBOOKList = document.getElementById('books');
  uncompletedBOOKList.innerHTML = '';

  const completedBOOKList = document.getElementById('completed-books');
  completedBOOKList.innerHTML = '';
  
  for (const bookItem of booksToRender) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';
 
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}