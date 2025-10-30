import "react";
import { Navbar, Nav, Container } from "react-bootstrap";

import "../styles/Header.css";

const Header = () => {
  return (
    <header>
      <Navbar>
        <Container>
          <Navbar.Brand className="mt-3" id="brand">出欠奉行 生徒用</Navbar.Brand>
          <Nav.Item>
          </Nav.Item>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
