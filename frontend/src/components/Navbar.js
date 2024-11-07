import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
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
            <Nav.Link href="/ReconExt">Recon-External</Nav.Link>
            <Nav.Link href="/RepresentState">Represent-State</Nav.Link>
            <Nav.Link href="/AttackTree">Attack-Tree-Generate</Nav.Link>
            <Nav.Link href="/Hypothesis">Hypothesis</Nav.Link>
            <Nav.Link href="/ValidateHypothesis">Validate Hypothesis</Nav.Link>
            <Nav.Link href="/ReconInt">Recon-Internal</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;