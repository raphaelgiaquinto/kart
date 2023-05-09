function loadImage(src)
{
    return new Promise((resolve)=>
    {
        let map = new Image()
        map.src = src
        map.onload = function()
        {
            resolve(map)
        }
    })
}

class Transform
{
    static radian(angle)
    {
        return angle * (Math.PI/180);
    }

    static rotate(px, py, ox, oy, angle)
    {
        let tx = px - ox 
        let ty = py - oy 

        let x = Math.cos(Transform.radian(angle)) * tx - Math.sin(Transform.radian(angle)) * ty
        let y = Math.sin(Transform.radian(angle)) * tx + Math.cos(Transform.radian(angle)) * ty

        return {x: x + ox, y: y + oy}
    }

}

class Kart
{
    constructor(centerX, centerY, width, height)
    {
        this.cx = centerX
        this.cy = centerY
        this.width = width
        this.height = height
        this.dirx = 0
        this.diry = -1
        this.angle = 0
        this.initCoords()
    }

    draw(ctx)
    {
        ctx.fillStyle = "red";
        ctx.beginPath()
        ctx.moveTo(this.tlx, this.tly)
        ctx.lineTo(this.trx, this.try)
        ctx.lineTo(this.brx, this.bry)
        ctx.lineTo(this.blx, this.bly)
        ctx.closePath()
        ctx.fill()
    }

    initCoords()
    {
        //top left
        this.tlx = this.cx - this.width / 2 
        this.tly = this.cy - this.height / 2

        //top right
        this.trx = this.cx + this.width / 2
        this.try = this.cy - this.height / 2

        //bottom left 
        this.blx = this.cx - this.width / 2
        this.bly = this.cy + this.height / 2

        //bottom right
        this.brx = this.cx + this.width / 2
        this.bry = this.cy + this.height / 2
    }

    ride(speed)
    {

        let dx = this.dirx * speed
        let dy = this.diry * speed

        //center
        this.cx += dx
        this.cy += dy
        
        //top left
        this.tlx += dx
        this.tly += dy

        //top right
        this.trx += dx
        this.try += dy

        //bottom left 
        this.blx += dx
        this.bly += dy

        //bottom right
        this.brx += dx
        this.bry += dy
    }

    rotate(angle)
    {
        this.angle += angle 
        
        let tl = Transform.rotate(this.tlx, this.tly, this.cx, this.cy, angle)
        let tr = Transform.rotate(this.trx, this.try, this.cx, this.cy, angle)
        let bl = Transform.rotate(this.blx, this.bly, this.cx, this.cy, angle)
        let br = Transform.rotate(this.brx, this.bry, this.cx, this.cy, angle)

        let dir = Transform.rotate(this.dirx, this.diry, 0, 0, angle)

        //top left
        this.tlx = tl.x 
        this.tly = tl.y

        //top right
        this.trx = tr.x 
        this.try = tr.y

        //bottom right
        this.brx = br.x 
        this.bry = br.y

        //bottom left
        this.blx = bl.x 
        this.bly = bl.y

        //direction
        this.dirx = dir.x 
        this.diry = dir.y
    }
}
