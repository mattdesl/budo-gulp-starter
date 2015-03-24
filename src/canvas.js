const rand = require('randf')
const range = require('array-range')
const triangulate = require('delaunay-triangulate')
const drawTriangles = require('draw-triangles-2d')
const friction = 0.99
const bunny = require('bunny')
const loop = require('raf-loop')

//vector math
const normalize = require('gl-vec2/normalize')
const sub = require('gl-vec2/subtract')
const mult = require('gl-vec2/multiply')

module.exports = function() {
  const ctx = require('2d-context')()
  const canvas = ctx.canvas

  //setup scaling
  let dpr = window.devicePixelRatio
  let rescale = require('canvas-fit')(ctx.canvas, window, dpr)
  window.addEventListener('resize', rescale, false)
  rescale()

  //initial point set
  let points = getPoints()

  //start rendering
  render(0)
  loop(render).start()
  return ctx

  function render(dt) {
    let t = dt / (1000/24)
    let { width, height } = canvas
    
    ctx.clearRect(0, 0, width, height)

    //triangualte and draw lines
    let positions = points.map(p => p.position)
    let cells = triangulate(positions)
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'hsl(0, 0%, 65%)'
    drawTriangles(ctx, positions, cells)
    ctx.stroke()

    //render and integrate points
    ctx.beginPath()
    points.forEach(point => {
      let [ x, y ] = point.position
      let [ vx, vy ] = point.velocity
      let radius = point.radius
      ctx.moveTo(x, y)
      ctx.arc(x, y, radius, 0, Math.PI*2, false)

      point.position[0] += vx * t
      point.position[1] += vy * t
      point.velocity[0] *= friction
      point.velocity[1] *= friction
    })
    ctx.fillStyle = '#000'
    ctx.fill()

  }

  function getPoints() {
    let { width, height } = canvas
    let tmp = [0, 0]
    let origin = [ width/2, height/2 ]
    let scale = 50
    //take some XY positions from the 3D bunny mesh
    return bunny.positions.map((x, i) => {
      let f = 0.15
      let velocity = [ rand(-f, f), rand(-f, f) ]
      let position = [ 
        width/2 + x[0] * scale, 
        height*0.7 + -x[1] * scale 
      ]
      
      //animate the vertices after a delay
      setTimeout(() => {
        let push = rand(5, -5)
        sub(tmp, position, origin)
        normalize(tmp, tmp)
        mult(velocity, tmp, [ push, push ])
      }, 500 + i*2)

      return {
        radius: rand(1, 7),
        velocity,
        position
      }
    }).slice(200, 900)
  }
}