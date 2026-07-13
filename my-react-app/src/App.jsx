import './App.css'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Page1 } from './pages/page1'
import { Page2 } from './pages/page2'
import { Page3 } from './pages/page3'
import { Layout } from './layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<Page1/>} />
          <Route path="/page2" element={<Page2/>} />
          <Route path="/page3" element={<Page3/>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
