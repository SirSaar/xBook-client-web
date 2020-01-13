import { observable, autorun, action, computed, decorate, reaction, runInAction } from 'mobx';
import { getMyUser, getUsers, addBook, updateBook, deleteBook, getUser, populateBook } from "../services/user.service";
import authStore from "./auth.store";
import { toJS } from 'mobx';

const getBooks = (user, available) => user && user.books && user.books.filter(
    book => book.available == available
).map(book => book.data);

class UserStore {
    users = [];     // users.books will be with only available books. todo: should be sorted by closeness/relationship
    isLoadingUsers;
    currentUser;    // users.books will be with all books: {book,available}
    isLoadingCurrentUser;
    selectedUser;
    isLoadingSelectedUser;
    usersPage;

    get myAvailableBooks() {
        return getBooks(this.currentUser, true)
    }

    get myNonAvailableBooks() {
        return getBooks(this.currentUser, false)
    }

    get usersBooks() {
        const books = [];
        let users = this.users;
        console.log('users',users)
        users.length && 
        users.map(user => 
            {  
                user = toJS(user)[0];
                console.log('user',user);
                user.books&&
                user.books.length && 
                user.books.map(({data,updatedAt}) => {
                    books.push({ ...data,
                        updatedAt,
                        userName: user.fullName, 
                        userThumbnail: user.picture, 
                        userId: user.id })
                })
            }
        );
        console.log(books)
        return books;
    }

    pullCurrentUser() {
        this.isLoadingCurrentUser = true;
        getMyUser()
            .then(action(user => { this.currentUser = user }))
            .finally(action(() => { this.isLoadingCurrentUser = false }));
    }

    pullSelectedUser(id) {
        this.isLoadingSelectedUser = true;
        getUser(id)
            .then(action(user => { this.selectedUser = user }))
            .finally(action(() => { this.isLoadingSelectedUser = false }));
    }

    pullUsers() {
        this.isLoadingUsers = true;
        getUsers(this.usersPage)
            .then(action(users => { this.users.push(users) }))
            .finally(action(() => { this.isLoadingUsers = false; }));
    }

    addBook(id, available) {
        //check if book already on list
        const book = this.currentUser.books.find(book => book.id === id);
        if (book) return;
        populateBook({ id: id, available })
            .then(
                action(book => this.currentUser.books.push(book))
            ).then(addBook(id, available))
            .catch(action(err => { this.pullCurrentUser(); throw err }));
    }

    updateBook(id, available) {
        const book = this.currentUser.books.find(book => book.id === id);
        book.available = available;
        return updateBook(id, available)
            .catch(action(err => { this.pullCurrentUser(); throw err }));
    }


    deleteBook(id) {
        const index = this.currentUser.books.findIndex(book => book.id === id);
        if (index > -1) this.currentUser.books.splice(index, 1);
        return deleteBook(id)
            .catch(action(err => { this.pullCurrentUser(); throw err }));
    }

    forgetCurrentUser() {
        this.currentUser = undefined;
    }

}
decorate(UserStore, {
    users: observable,
    isLoadingCurrentUser: observable,
    isLoadingSelectedUser: observable,
    isLoadingUsers: observable,
    currentUser: observable,
    selectedUser: observable,
    myAvailableBooks: computed,
    myNonAvailableBooks: computed,
    usersBooks: computed,
    pullCurrentUser: action,
    pullSelectedUser: action,
    pullUsers: action,
    addBook: action,
    updateBook: action,
    deleteBook: action,
    forgetCurrentUser: action,
    usersPage: observable
})

const userStore = new UserStore();
export default userStore;

reaction(() => userStore.usersPage, () => {
    userStore.pullUsers();
},
    {
        onError(e) {
            console.error('error load user data')
        }
    }
);

reaction(() => authStore.token, () => {
    runInAction(() => {
        userStore.usersPage = 0;
    });
    userStore.pullCurrentUser();
},
    {
        onError(e) {
            console.error('error load user data')
        }
    }
);
