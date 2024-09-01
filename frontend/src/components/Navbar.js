import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';

function NavBar() {
  return (
    <Navbar className="bg-body-tertiary" expand="lg" bg="dark" data-bs-theme="dark" sticky="top">
      <Container>
        <Navbar.Brand href="/">Project</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/Docs">Docs</Nav.Link>
            <Nav.Link href="/ReconInt">Recon-Internal</Nav.Link>
            <Nav.Link href="/ReconExt">Recon-External</Nav.Link>
            <Nav.Link href="/RepresentState">Represent-State</Nav.Link>
            <Nav.Link href="/AttackTree">Attack-Tree-Generate</Nav.Link>
            <Nav.Link href="/Hypothesis">Hypothesis</Nav.Link>
            {/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;