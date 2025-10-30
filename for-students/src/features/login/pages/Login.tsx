import 'react';
import '../style/Login.css'
import { Form, Button, Container } from 'react-bootstrap';
import { login } from '../../../shared';
import { useRef } from 'react';

const Login = () => {

  const tenantID = useRef<HTMLInputElement>(null);
  const studentID = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const Login = async (): Promise<void> => {
    if(tenantID.current === null || studentID.current === null || password.current === null) return alert('すべての項目を入力してください');
    
    const tenantIDValue: string = tenantID.current.value;
    const studentIDValue: string = studentID.current.value;
    const passwordValue: string = password.current.value

    if(tenantIDValue == "" || studentIDValue == "" || passwordValue == "") return alert('すべての項目を入力してください')

    const tokens = await login(tenantIDValue, studentIDValue, passwordValue);
    localStorage.setItem('token', tokens.token.access_token)
  }

  return (
    <Container className="login">
      <h2 className='login-title'>ログイン</h2>
      <Form>
        <Form.Group>          
          <Form.Label>学校ID</Form.Label>
          <Form.Control placeholder='学校ID' ref={tenantID}></Form.Control>
        </Form.Group>
        <Form.Group>          
          <Form.Label>学籍番号</Form.Label>
          <Form.Control placeholder='学籍番号' ref={studentID}></Form.Control>
        </Form.Group>
        <Form.Group className='mt-3'>
          <Form.Label>パスワード</Form.Label>
          <Form.Control placeholder='パスワード' ref={password}></Form.Control>
        </Form.Group>

        <Button onClick={Login} className='login-btn' variant='primary'>ログイン</Button>
        
      </Form>
    </Container>
  )
}

export default Login;