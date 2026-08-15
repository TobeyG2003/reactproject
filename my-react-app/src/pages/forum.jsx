import { Link } from 'react-router-dom'
import { Forumpost } from '../components/forumpost'
import { Comment } from '../components/comment'

export function Forum() {
  return (
    <>
      <section id="forum">
        <div className="content">
          <h1>Forum</h1>
          <p>This is the content of the Forum page.</p>
          <Forumpost />
          <Comment/>
        </div>
      </section>
    </>
  )
}