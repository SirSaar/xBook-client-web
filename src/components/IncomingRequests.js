import React, {useEffect} from 'react';
import { BookGrid, RequestBookGrid } from './BookGrid';
import { inject,observer } from "mobx-react";

const IncomingRequests = ({requestStore}) => {
    useEffect(()=>{requestStore.pullIncoming()},[])
    return (
        <RequestBookGrid books={requestStore.incoming} isIncoming={true}/>
    );
};

export default inject('requestStore')(observer(IncomingRequests));