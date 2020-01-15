import { decorate, observable, reaction,action, computed } from "mobx";
import { addRequest, getIncoming, getOutgoing } from '../services/request.service'
import authStore from "./auth.store";
import { toJS } from 'mobx';

class RequestStore {
    incoming = [];
    outgoing = [];
    authStore;
    constructor(authStore) {
        this.authStore = authStore;
    }

    addRequest(book, receiving) {
            addRequest(book, receiving)
            .then(action((n)=>{this.outgoing.push(n)}))
    }

    pullIncoming() {
        getIncoming()
        .then(action((incoming)=>{this.incoming=incoming}))
    }

    pullOutgoing() {
        getOutgoing()
        .then(action((outgoing)=>{this.outgoing=outgoing}))
    }

    get incomingBooks() {
        const books = [];
        const requests = this.incoming.map(r=>toJS(r));
        requests.length && 
        requests.map(request => 
            {  
                request&&books.push({
                    ...request.book,
                    read: request.receiving,
                    id: request.id,
                    updatedAt: request.updatedAt,
                    status: request.status,
                    userName: request.requesting.fullName, 
                    userThumbnail: request.requesting.picture, 
                    userId: request.requesting.id 
                })

            }
        );

        return books;
    }

    get outgoingBooks() {
        const books = [];
        const requests = this.outgoing.map(r=>toJS(r));
        requests.length && 
        requests.map(request => 
            {
                request&&books.push({
                    ...request.book,
                    read: request.requesting,
                    id: request.id,
                    updatedAt: request.updatedAt,
                    status: request.status,
                    userName: request.receiving.fullName, 
                    userThumbnail: request.receiving.picture, 
                    userId: request.receiving.id 
                })

            }
        );
        return books;
    }
}
decorate(RequestStore, {
    incoming: observable,
    outgoing: observable,
    addRequest: action,
    incomingBooks: computed,
    outgoingBooks: computed
})

const requestStore = new RequestStore(authStore);
export default requestStore;

reaction(() => requestStore.authStore.token, () => {
    requestStore.pullIncoming();
    requestStore.pullOutgoing();
},
    {
        onError(e) {
            console.error('error load requests')
        }
    }
);