import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <>     
        <Link to="/">
            <button>Go to Page 1</button>
        </Link>
        <Link to="/page2">
            <button>Go to Page 2</button>
        </Link>
        <Link to="/page3">
            <button>Go to Page 3</button>
        </Link>
    </>
    )
}