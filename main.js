const WIDTH = 640 
const HEIGHT = 640

let canvas = document.getElementById("canvas")
canvas.width = WIDTH
canvas.height = HEIGHT
let ctx = canvas.getContext("2d")

let view = document.getElementById("view")
let ctxView = view.getContext("2d")
view.width = WIDTH
view.height = HEIGHT

let kart = new Kart(70, 350, 20, 50)

let turnLeft = false
let turnRight = false 
let ride = false
let speed = 0.0
let map = undefined
let kartImage = undefined

async function render()
{
    ctx.drawImage(map, 0, 0, WIDTH, HEIGHT)
    ctxView.clearRect(0, 0, WIDTH, HEIGHT)
    ctxView.save()
    ctxView.translate(WIDTH/2, HEIGHT/2)
    ctxView.scale(8, 8)
    ctxView.drawImage(map, -kart.cx, -kart.cy, WIDTH, HEIGHT)
    ctxView.restore()
    ctxView.save()
    ctxView.translate(WIDTH/2, HEIGHT/2)
    ctxView.rotate(Transform.radian(kart.angle))
    ctxView.drawImage(kartImage, -kart.width*2, -kart.height, kart.width*4, kart.height*2)
    ctxView.restore()
    kart.draw(ctx)

}

async function update()
{
    if(turnRight)
        kart.rotate(4)
    if(turnLeft)
        kart.rotate(-4)
    if(ride)
    {
        if(speed < 2.0)
        {
            speed += 0.1
        }
    }
    else
    {
        if(speed > 0)
        {
            speed -= 0.1
        }
        else 
            speed = 0
    }
    kart.ride(speed)
}

async function main()
{
    map = await loadImage("map.png")
    kartImage = await loadImage("kart.png")

    window.addEventListener("keydown", (event) => {
        if(event.key == "d")
            turnRight = true
        if(event.key == "q")
            turnLeft = true 
        if(event.key == "z")
            ride = true
    })

    window.addEventListener("keyup", (event) => {
        if(event.key == "d")
            turnRight = false
        if(event.key == "q")
            turnLeft = false 
        if(event.key == "z")
            ride = false
    })

    setInterval(()=>
    {
        update()
        render()
    }, 16)
}

main()