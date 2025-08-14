import { Link } from 'react-router-dom';
import "./Navigation.css";
export default function Navigation(){

    return(
        <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/AddGameForm">Add Game</Link>
        </nav>
    )
}