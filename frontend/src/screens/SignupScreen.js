import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils.js';

// ── Disposable / spam email domains blocklist
const DISPOSABLE_DOMAINS = new Set([
  // Major disposable providers
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info', 'guerrillamailblock.com',
  'tempmail.com', 'temp-mail.org', 'temp-mail.ru', 'tempinbox.com', 'tempr.email',
  'throwam.com', 'throwaway.email', 'trashmail.com', 'trashmail.me', 'trashmail.net',
  'trashmail.at', 'trashmail.io', 'trashmail.org', 'trashmail.xyz', 'dispostable.com',
  'maildrop.cc', 'yopmail.com', 'yopmail.fr', 'yopmail.net', 'spam4.me',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  'getnada.com', 'getairmail.com', 'fakeinbox.com', 'fake-box.com', 'fakemailgenerator.com',
  'mailnull.com', 'mailnesia.com', 'mailexpire.com', 'mail-temporaire.fr',
  'sharklasers.com', 'guerrillamail.info', 'grr.la', 'spam.la',
  'getonemail.net', 'mytrashmail.com', 'sofimail.com', 'suremail.info',
  'throwam.com', 'throwam.net', '0-mail.com', '0815.ru', '0box.eu',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.co.uk',
  '10minutemail.de', '10minutemail.pl', '10minutemail.pro', '10minutemail.us',
  '10minemail.com', '10minutesmail.com', '20minutemail.com', '20minutemail.it',
  'mailmoat.com', 'emailondeck.com', 'discard.email', 'discardmail.com',
  'discardmail.de', 'spamfree24.org', 'spamfree24.de', 'spamfree24.net',
  'spamfree24.eu', 'spamfree24.info', 'filzmail.com', 'fakemail.net',
  'mohmal.com', 'mailnull.com', 'deadaddress.com', 'disposableaddress.com',
  'mailscrap.com', 'mintemail.com', 'mailnew.com', 'binkmail.com',
  'owlpic.com', 'spamhere.net', 'no-spam.ws', 'nospam.ze.tc',
  'rmqkr.net', 'klzlk.com', 'byom.de', 'pookmail.com',
  'gishpuppy.com', 'hulapla.de', 'incognitomails.com', 'e4ward.com',
  'spamobox.com', 'shieldemail.com', 'mailincubator.com', 'spamcowboy.com',
  'spamcowboy.net', 'spamcowboy.org', 'mailblocks.com', 'mailzilla.com',
  'mailzilla.org', 'safetymail.info', 'jetable.fr.nf', 'jetable.net',
  'jetable.org', 'jetable.com', 'noref.in', 'deadletter.ga',
  'bugmenot.com', 'spamgob.com', 'spamspot.com', 'spamstack.net',
  // Regex-style catches (checked by domain substring)
  'tempinbox', 'throwaway', 'disposable', 'trashmail', 'spammail',
  'fakeinbox', 'nospam', 'antispam',
]);

// ── Allowed legitimate domains whitelist (fast-pass, skip disposable check)
const ALLOWED_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.com.pk',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'protonmail.ch', 'pm.me',
  'aol.com', 'zoho.com',
  'edu', 'ac.pk', 'edu.pk', 'ac.uk',
]);

/**
 * Returns true if the email is valid (passes all checks).
 * Returns an error string if invalid.
 */
function validateEmail(email) {
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address.';
  }

  const domain = email.split('@')[1].toLowerCase();

  // Allow known-good domains immediately
  if (ALLOWED_DOMAINS.has(domain)) return null;

  // Check TLD for .edu, .ac.* etc
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  if (tld === 'edu' || domain.endsWith('.ac.pk') || domain.endsWith('.edu.pk') || domain.endsWith('.ac.uk')) {
    return null;
  }

  // Check against disposable domain list (exact match)
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return 'Disposable or temporary email addresses are not allowed. Please use a real email.';
  }

  // Check if domain contains any disposable keywords
  const disposableKeywords = [
    'tempmail', 'throwaway', 'trashmail', 'mailinator', 'guerrilla',
    'disposable', 'fakeinbox', 'spammail', 'yopmail', '10minute',
    'minutemail', 'burner', 'throwam', 'discard', 'nospam',
  ];
  for (const kw of disposableKeywords) {
    if (domain.includes(kw)) {
      return 'Disposable or temporary email addresses are not allowed. Please use a real email.';
    }
  }

  // Check for suspicious patterns: very short domain, no TLD, etc.
  if (parts.length < 2) {
    return 'Please enter a valid email address.';
  }

  return null; // Valid
}

export default function SignupScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/home';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val.length > 5) {
      const err = validateEmail(val);
      setEmailError(err || '');
    } else {
      setEmailError('');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Client-side email validation
    const emailErr = validateEmail(email);
    if (emailErr) {
      toast.error(emailErr);
      setEmailError(emailErr);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const { data } = await Axios.post('/api/users/signup', {
        name,
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/home');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <h1 className="my-3">Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control required onChange={(e) => setName(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            required
            value={email}
            onChange={handleEmailChange}
            isInvalid={!!emailError}
            placeholder="e.g. yourname@gmail.com"
          />
          <Form.Control.Feedback type="invalid">
            {emailError}
          </Form.Control.Feedback>
          {!emailError && email.includes('@') && (
            <Form.Text className="text-success" style={{ fontSize: '0.82rem' }}>
              ✓ Valid email address
            </Form.Text>
          )}
          <Form.Text className="text-muted" style={{ fontSize: '0.8rem' }}>
            Use a real email (Gmail, Yahoo, Outlook, etc.). Disposable emails are not allowed.
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit" disabled={!!emailError}>Sign Up</Button>
        </div>
        <div className="mb-3">
          Already have an account{' '}
          <Link to={`/signin?redirect=${redirect}`}>Sign In</Link>
        </div>
      </Form>
    </Container>
  );
}
