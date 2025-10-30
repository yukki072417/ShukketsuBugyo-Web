import { useRef, useEffect } from 'react';
import '../styles/login.css';
import { Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { login } from '../../../shared/api/common';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { t } = useTranslation('login');
  const teacher_id = useRef<HTMLInputElement>(null);
  const tenant_id = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/teacher/main');
    }
  }, [navigate]);

  const sendRequest = async () => {
    if (!teacher_id.current || !password.current || !tenant_id.current) {
      alert('ID and password are required');
      return;
    }
    
    const _tenantID = tenant_id.current.value;
    const _userID = teacher_id.current.value;
    const _password = password.current.value;

    if (! _tenantID || !_userID || !_password) {
      alert('ID and password are required');
      return;
    }

    const data = await login(_tenantID, _userID, _password);
    
    if (data?.result === 'SUCCESS' && data.token.access_token && data.token.refresh_token) {
      localStorage.setItem('token', data.token.access_token);
      localStorage.setItem('refreshToken', data.token.refresh_token);
      
      navigate('/teacher/main');
    } else {
      alert(t('login_failed'));
    }
  };

  return (
    <Form className='admin-login'>
      <Form.Group className='md-3'>
        <Form.Label className='form-items'>{t('tenant_id_label')}</Form.Label>
          <Form.Control 
            ref={tenant_id} 
            className='form-items' 
            type='text' 
            placeholder={t('tenant_id_label')} 
          />
        <Form.Label className='form-items'>{t('teacher_id_label')}</Form.Label>
        <Form.Control 
          ref={teacher_id} 
          className='form-items' 
          type='text' 
          placeholder={t('teacher_id_label')} 
        />
        <Form.Label className='form-items'>{t('password_label')}</Form.Label>
        <Form.Control 
          ref={password} 
          className='form-items' 
          type='password' 
          placeholder={t('password_label')} 
        />
        <Button 
          onClick={sendRequest} 
          className='submit-button'
        >
          {t('submit_button')}
        </Button>
      </Form.Group>
    </Form>
  );
};

export default Login;