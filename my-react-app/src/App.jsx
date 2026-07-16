import './App.css'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Page1 } from './pages/page1'
import { Page2 } from './pages/page2'
import { Search } from './pages/search'
import { Login } from './pages/login'
import { Signup } from './pages/signup'
import { Layout } from './layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<Page1/>} />
          <Route path="/page2" element={<Page2/>} />
          <Route path="/search" element={<Search/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<Signup/>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
