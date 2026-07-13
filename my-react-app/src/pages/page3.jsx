import { Link } from 'react-router-dom'

export function Page3() {
  return (
    <>
      <section id="page3">
        <div className="content">
          <h1>Page 3</h1>
          <p>This is the content of Page 3.</p>
          <Link to="/page2">Go to Page 2</Link>
            <Link to="/">Go to Page 1</Link>
        </div>
      </section>
    </>
  )
}
