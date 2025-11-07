import { Link, useLocation } from 'react-router';


export default function Header() {
    const location = useLocation();
    let pageTitle = "";
    switch (location.pathname) {
        case '/':
            pageTitle = "Home";
            break;
        case '/Contract':
            pageTitle = "Contract";
            break;
        case '/Introduction':
            pageTitle = "Introduction";
            break;
        default:
            pageTitle = "";
    }

    return (
        <header>
            <h1>ITIS 3135 | Grimble Curiel Gluttonous Chupacabra | <span id="page-title-placeholder">{pageTitle}</span></h1>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li>|</li>
                    <li><Link to="/Contract">Contract</Link></li>
                    <li>|</li>
                    <li><Link to="/Introduction">Introduction</Link></li>
                </ul>
            </nav>
        </header >
    );
}