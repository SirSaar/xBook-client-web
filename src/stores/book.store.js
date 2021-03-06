import { observable, action, computed, decorate } from 'mobx';
import { addBook, updateBook, deleteBook, getBooks, getMyBooks} from "../services/book.service";

class BookStore {

    booksPage = 0;
    myBooks = []; 
    books = [];
    isLoadingBooks = true;
    isLoadingMyBooks = true;

    pullNextPage() {
        this.booksPage++;
        this.pullBooks();
    }

    pullBooks() {
        this.isLoadingBooks = true;
        getBooks(this.booksPage)
            .then(action(books => { 
                this.books = books;
                // for pagination uncomment
                // this.books = this.books.concat(books)
             }))
            .finally(action(() => { this.isLoadingBooks = false; }));
    }

    pullMyBooks() {
        this.isLoadingMyBooks = true;
        getMyBooks()
            .then(action(books => { this.myBooks = books }))
            .finally(action(() => { this.isLoadingMyBooks = false }));
    }

    addBook(id, available) {
        const index = this.myBooks.findIndex(book => book.id === id);
        if(index>-1) return;
        addBook(id, available)
        .then(action( ()=>{this.pullMyBooks()} ))
    }

    updateBook(id, available) {
        const index = this.myBooks.findIndex(book => book.id === id);
        if(index>-1) {
            this.myBooks[index].available = available;
            updateBook(id, available)
            .catch(action(err => { this.pullMyBooks(); throw err }));      
        };

    }


    deleteBook(id) {
        const index = this.myBooks.findIndex(book => book.id === id);
        if (index > -1) {
            this.myBooks.splice(index, 1);
            deleteBook(id)
            .catch(action(err => { this.pullMyBooks(); throw err }));
        }
    }

}
decorate(BookStore, {
    addBook: action,
    updateBook: action,
    deleteBook: action,
    pullBooks: action,
    booksPage: observable,
    books: observable,
    myBooks: observable,
    isLoadingBooks: observable,
    isLoadingMyBooks: observable,
    pullNextBooks: action,
    pullMyBooks: action,
    nextPage: action
})

const bookStore = new BookStore();
export default bookStore;