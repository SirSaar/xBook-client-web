import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Button,makeStyles,Container } from "@material-ui/core";
import { useTheme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import UserAvatar from '../components/UserAvatar';
import { observer,inject } from "mobx-react";
import Loading from './Loading';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import {ExitToApp,Phone,Done} from '@material-ui/icons';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import UserRating from './UserRating';
import TextField from '@material-ui/core/TextField';
import {genericPhonePattern} from '../config';

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
  }

  
const useStyles = makeStyles((theme)=>({
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
        zIndex: 100,
    },
    root: {
        marginTop: theme.spacing(3),
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
      },
    inline: {
    display: 'inline',
    },
    formIcon: {
        marginTop: theme.spacing(2)
    },
    form: {
      display: 'flex',
    },
    submitButton: {
      paddingBottom: 0,
      paddingRight: 0
    }
}));

const SettingsDialog = ({ handleClose, open,userStore,authStore }) => {
    const theme = useTheme();
    const classes = useStyles();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [phone,setPhone] = useState('');
    useEffect(()=>
    userStore.currentUser&&setPhone(userStore.currentUser.phone),
    [userStore.isLoadingCurrentUser]);

    if(userStore.isLoadingCurrentUser) {
      return <Loading/>
    }

    const handleChange=(event)=>{
      event.persist();
      switch(event.target.name) {
        case 'phone':
          setPhone(event.target.value);
          break;
      }
    }
    const handlePhoneSubmit=(event)=>{
      event.preventDefault();
      handleSubmit('phone',phone);
    }
    const handleSubmit=(name,value) => {
      switch(name) {
        case 'phone':
          if(!value) break;
          if(!RegExp(genericPhonePattern).test(value)) return;
        break;
      }
      console.log(name,value)
      userStore.updateCurrent(name,value);
    }

    return (
    <Dialog
    fullScreen={fullScreen}
    open={open}
    onClose={handleClose}
    aria-labelledby="settings"
    >
        <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
        </IconButton>
        <DialogContent>
        
    <List className={classes.root}>
      <ListItem alignItems="center">
        <ListItemAvatar>
            <UserAvatar picture={userStore.currentUser.picture} name={userStore.currentUser.fullName}/>
        </ListItemAvatar>
        <ListItemText
          primary={userStore.currentUser.fullName}
          secondary={<UserRating {...userStore.currentUser}/>}
        />
      </ListItem>
      <Divider component="li" />
      <ListItem>
          <ListItemIcon className={classes.formIcon}>
            <Phone />
          </ListItemIcon>
          <form className={classes.form}
          noValidate
          autoComplete="off" onSubmit={(e)=>{handlePhoneSubmit(e);return false;}}>
            <TextField id="phone" label="Phone" variant="standard" name="phone"
            type="tel" value={phone} onChange={(e)=>handleChange(e)}/>
            <IconButton type="submit" className={classes.submitButton}>
              <Done />
            </IconButton>
          </form>
      </ListItem>
      <Divider component="li" />
      <ListItemLink onClick={()=>{authStore.logout()}}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout"/>
      </ListItemLink>
    </List>
        </DialogContent>
    </Dialog>
    );
};

SettingsDialog.propTypes = {
    
};

export default inject('userStore','authStore')(observer(SettingsDialog));