import 'react'
import './header.css'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { useTranslation } from 'react-i18next';
import LanguageButton from './LanguageButton'
const Header = (): any => {
  const { t } = useTranslation('common');
    return(
        <>
            <header className="header">
                <Navbar>
                    <Container>
                        <Navbar.Brand id='brand'>{t("header_title")}</Navbar.Brand>
                        <Nav.Item><LanguageButton /></Nav.Item>
                    </Container>
                </Navbar>
            </header>
        </>
    );
}

export default Header