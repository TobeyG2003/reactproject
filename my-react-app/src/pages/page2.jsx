import { Link } from 'react-router-dom'
import { Forumpost } from '../components/forumpost'
import { Comment } from '../components/comment'

export function Page2() {
  return (
    <>
      <section id="page2">
        <div className="content">
          <h1>Page 2</h1>
          <p>This is the content of Page 2.</p>
          <Forumpost />
          <Comment/>
        </div>
      </section>
    </>
  )
}