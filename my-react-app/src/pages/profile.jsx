import { Link } from 'react-router-dom'

export function Profile() {
  return (
    <>
      <section id="page2">
        <div className="content">
          <h1>Page 2</h1>
          <p>This is the content of Page 2.</p>
          <Link to="/">Go to Page 1</Link>
            <Link to="/page3">Go to Page 3</Link>
        </div>
      </section>
    </>
  )
}