import {Button, Container, Form, FormControl, Nav, Navbar} from "react-bootstrap";
import {Link, useHistory} from "react-router-dom";
import {useRef, useState} from "react";

const Layout = ({children}) => {
    const [searchValue, setSearchValue] = useState('');
    const history = useHistory();

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleSearch = (e) => {
        e.preventDefault();
        history.push('/?q=' + encodeURI(searchValue));
    }

    return (
        <div>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/">Christmas Tree Writer</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link as={Link} to="/">Post List</Nav.Link>
                            <Nav.Link as={Link} to="/edit">New Post</Nav.Link>
                            <Nav.Link as={Link} to="/jobs">Jobs</Nav.Link>
                        </Nav>
                        <Form inline onSubmit={handleSearch}>
                            <FormControl value={searchValue} onChange={handleSearchChange} type="text" placeholder="Search" className="mr-sm-2"/>
                            <Button variant="outline-success" type="submit">Search</Button>
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container>
                {children}
            </Container>
        </div>

    );
}

export default Layout;