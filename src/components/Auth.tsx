import React, { useState } from 'react';
import styles from './Auth.module.css';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../features/userSlice';
import { auth, provider, storage } from '../firebase';
import {
  Typography,
  Link,
  makeStyles,
  Grid,
  CssBaseline,
  Paper,
  Avatar,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  IconButton,
} from '@material-ui/core';

import {
  Send,
  Camera,
  Email,
  LockOutlined,
  AccountCircle,
} from '@material-ui/icons';
import { nanoid } from 'nanoid';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Auth: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   !をつけるとnullではないよって教えてあげられる。
    // そうしないとアクセス出来ないエラーが出る
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0]);
      //   初期化してあげないと仕様で同じファイルでのonChangeが発動しないそうな。
      e.target.value = '';
    }
  };

  const signInEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const signUpEmail = async () => {
    // 返り値として作ったUserのオブジェクトを定数に入れて受け取る
    const authUser = await auth.createUserWithEmailAndPassword(email, password);
    let url = '';
    if (avatarImage) {
      const randomChar = nanoid();
      const fileName = randomChar + '_' + avatarImage.name;

      await storage.ref(`avatars/${fileName}`).put(avatarImage);
      url = await storage.ref('avatars').child(fileName).getDownloadURL();
    }
    // firebase側を更新する処理
    await authUser.user?.updateProfile({
      displayName: userName,
      photoURL: url,
    });
    // reduxのstateを更新する為の処理
    dispatch(
      updateUserProfile({
        displayName: userName,
        photoUrl: url,
      })
    );
  };

  const signInGoogle = async () => {
    await auth.signInWithPopup(provider).catch((err) => alert(err.message));
  };

  return (
    <Grid container component='main' className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlined />
          </Avatar>
          <Typography component='h1' variant='h5'>
            {isLogin ? 'Login' : 'Register'}
          </Typography>
          <form className={classes.form} noValidate>
            {!isLogin && (
              <>
                <TextField
                  variant='outlined'
                  margin='normal'
                  required
                  fullWidth
                  id='userName'
                  label='UserName'
                  name='userName'
                  autoComplete='userName'
                  autoFocus
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                  }}
                />
                <Box textAlign='center'>
                  <IconButton>
                    <label>
                      <AccountCircle
                        fontSize='large'
                        className={
                          avatarImage
                            ? styles.login_addIconLoaded
                            : styles.login_addIcon
                        }
                      />
                      <input
                        className={styles.login_hiddenIcon}
                        type='file'
                        onChange={onChangeImageHandler}
                      />
                    </label>
                  </IconButton>
                </Box>
              </>
            )}
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />

            <Button
              disabled={
                isLogin
                  ? !email || password.length < 6
                  : !userName || !email || password.length < 6 || !avatarImage
              }
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              startIcon={<Email />}
              onClick={
                isLogin
                  ? async () => {
                      try {
                        await signInEmail();
                      } catch (err) {
                        alert(err.message);
                      }
                    }
                  : async () => {
                      try {
                        await signUpEmail();
                      } catch (err) {
                        alert(err.message);
                      }
                    }
              }
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>

            <Grid container>
              {/* xsはデフォルトでtrueなので２こ並べたときに片方trueにしておくと
                余りの部分を他の要素みたいな感じになるのでもう片方が右端による */}
              <Grid item xs>
                <span className={styles.login_reset}>Forgot password?</span>
              </Grid>
              <Grid item>
                <span
                  className={styles.login_toggleMode}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Create new account ?' : 'Back to Login'}
                </span>
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              onClick={signInGoogle}
            >
              Sign In With Google
            </Button>
          </form>
        </div>
      </Grid>
    </Grid>
  );
};

export default Auth;
