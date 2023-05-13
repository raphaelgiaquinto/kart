/**
 * Asynchronous image loader
 */
let ImageLoader = 
{
    load: function(source)
    {
        return new Promise((resolve) => 
        {
            let image = new Image()
            image.src = source
            image.onload = () => resolve(image)
        })
    }
}

/***
 * Transform utilities
 */
let Transform = 
{
    radian : function(angle)
    {
        return angle * (Math.PI/180);
    },
    rotate : function(px, py, ox, oy, angle)
    {
        let tx = px - ox 
        let ty = py - oy 

        let x = Math.cos(this.radian(angle)) * tx - Math.sin(this.radian(angle)) * ty
        let y = Math.sin(this.radian(angle)) * tx + Math.cos(this.radian(angle)) * ty

        return {x: x + ox, y: y + oy}
    }
}

/***
 * Represents a kart riding on the map.
 * Basicaly, a kart is represented by 4 points in 2d, each represents a coordinate on the map (top left/right, bottom left/right)
 */
let Kart = function(center_x, center_y, width, height, sprite)
{
    this.cx = center_x
    this.cy = center_y
    this.width = width
    this.height = height
    this.dirx = 0
    this.diry = -1
    this.angle = 0
    this.speed = 0.0
    this.speed_limit = 2.0
    this.speed_step = 0.1
    this.is_riding = false 
    this.is_riding_back = false
    this.turning_left = false 
    this.turning_right = false
    this.sprite = sprite

    this.draw = function(ctx)
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

    this.initCoords = function()
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

    this.compute_next_position = function()
    {
        let dx = this.dirx * this.speed
        let dy = this.diry * this.speed

        return {x: this.cx + dx, y: this.cy + dy}
    }

    this.ride = function()
    {

        let dx = this.dirx * this.speed
        let dy = this.diry * this.speed

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

    this.rotate = function(angle)
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

    this.turn_left = function()
    {
        this.rotate(-this.speed*2)
    }

    this.turn_right = function()
    {
        this.rotate(this.speed*2)
    }

    this.kart_riding_state = function()
    {
        if(this.is_riding)
        {
            if(this.speed_step < 0)
            {
                this.speed_step *= -1
            }

            if(this.speed < this.speed_limit)
            {
                this.speed += this.speed_step
            }
        }
        else if(this.is_riding_back)
        {
            if(this.speed_step > 0)
            {
                this.speed_step *= -1
            }

            if(this.speed > -this.speed_limit)
            {
                this.speed += this.speed_step
            }
        }

        return this.is_riding || this.is_riding_back
    }
    
    this.update = function()
    {   
        if(!this.kart_riding_state())
        {
            if(this.speed_step > 0)
            {
                if(this.speed > 0)
                {
                    this.speed -= this.speed_step
                }
                else 
                {
                    this.speed = 0
                }
            }
            else
            {
                if(this.speed < 0)
                {
                    this.speed -= this.speed_step
                }
                else 
                {
                    this.speed = 0
                }
            }
        }

        if(this.turning_left)
        {
            this.turn_left()
        }
        else if(this.turning_right)
        {
            this.turn_right()
        }
    }

    this.initCoords()
}

/***
 * The main object which is the engine of all things. 
 * It can draw the map (global top view and projected player view), manage the karts states, manage the inputs, and ochestrate all things.
 * This engine is really basic at this moment, but we can imagine some functions to determine the collisions between the player and the obstacles,
 * basic AI for the kart enemies, points system, level system etc ...
 */
let Engine = 
{
    global: { canvas: undefined, ctx: undefined, collisions_ctx: undefined },
    view: { canvas: undefined, ctx: undefined },
    inputs: [],
    karts: [],
    player_kart: undefined,
    map: undefined,
    keys: 
    {
        FORWARD: "z",
        LEFT: "q",
        RIGHT: "d",
        BACK: "s"
    },
    collisions:[],
    use_canvas : function(global_id, view_id)
    {
        this.global.canvas = document.getElementById(global_id)
        this.view.canvas = document.getElementById(view_id)
        this.global.ctx = this.global.canvas.getContext("2d")
        this.view.ctx = this.view.canvas.getContext("2d")
    },

    register_input: function(key, is_pressed, callback)
    {
        this.inputs.push({key, is_pressed, callback})
    },

    trigger_input(key, is_pressed)
    {
        let input = this.inputs.filter(input => input.key == key && input.is_pressed == is_pressed).pop()
        if(input)
        {
            input.callback()
        }
    },

    activate_key_listeners: function()
    {
        window.addEventListener("keyup", (event) => { 
            this.trigger_input(event.key, false)
        })
        
        window.addEventListener("keydown", (event) => { 
            this.trigger_input(event.key, true)
        })
    },

    update_karts : function()
    {
        this.karts.forEach(kart => kart.update())
        this.player_kart.update()
        let {x, y} = this.player_kart.compute_next_position()
        let colliding = this.is_colliding(x, y)
        if(!colliding)
        {
            this.player_kart.ride()
        }
    },

    render_kart_on_game_view : function()
    {
        this.view.ctx.clearRect(0, 0, this.view.canvas.width, this.view.canvas.height)
        this.view.ctx.save()
        this.view.ctx.translate(this.view.canvas.width/2, this.view.canvas.height/2)
        this.view.ctx.scale(8, 8)
        this.view.ctx.drawImage(this.map, -this.player_kart.cx, -this.player_kart.cy, this.view.canvas.width, this.view.canvas.height)
        this.view.ctx.restore()
        this.view.ctx.save()
        this.view.ctx.translate(this.view.canvas.width/2, this.view.canvas.height/2)
        this.view.ctx.rotate(Transform.radian(this.player_kart.angle))
        this.view.ctx.drawImage(
            this.player_kart.sprite, 
            -this.player_kart.width*2, 
            -this.player_kart.height, 
            this.player_kart.width*4, 
            this.player_kart.height*2
        )
        this.view.ctx.restore()
    },

    add_collision_detection : function(predicate)
    {
        this.collisions.push(predicate)
    },

    is_colliding(x, y)
    {
        return this.collisions.some(collision => collision(this.extract_pixel_from_collisions_map(x, y)))
    },

    load_collisions_map : function(collisions_map)
    {
        let tmp = document.createElement("canvas")
        tmp.width = this.global.canvas.width
        tmp.height = this.global.canvas.height
        this.global.collisions_ctx = tmp.getContext("2d")
        this.global.collisions_ctx.drawImage(collisions_map, 0, 0, tmp.width, tmp.height)
    },


    extract_pixel_from_collisions_map : function(x, y)
    {
        let pixel = this.global.collisions_ctx.getImageData(parseInt(x), parseInt(y), 1, 1)
        if(pixel)
        {
            return [pixel.data[0], pixel.data[1], pixel.data[2]]     
        }
        return undefined
    },

    render_global_view : function()
    {
        this.global.ctx.drawImage(this.map, 0, 0, this.global.canvas.width, this.global.canvas.height)
        this.karts.forEach(kart => kart.draw(this.global.ctx))
        this.player_kart.draw(this.global.ctx)
    },

    render_game_view : function()
    {
        this.render_kart_on_game_view()
    },

    activate_base_inputs_keys : function()
    {
        this.register_input(this.keys.FORWARD, true, () =>
        {
            this.player_kart.is_riding = true
        })
    
        this.register_input(this.keys.FORWARD, false, () =>
        {
            this.player_kart.is_riding = false
        })
        
        this.register_input(this.keys.BACK, true, () =>
        {
            this.player_kart.is_riding_back = true
        })
    
        this.register_input(this.keys.BACK, false, () =>
        {
            this.player_kart.is_riding_back = false
        })

        this.register_input(this.keys.LEFT, true, () =>
        {
            this.player_kart.turning_left = true
        })
    
        this.register_input(this.keys.RIGHT, true, () =>
        {
            this.player_kart.turning_right = true
        })
    
        this.register_input(this.keys.LEFT, false, () =>
        {
            this.player_kart.turning_left = false
        })
    
        this.register_input(this.keys.RIGHT, false, () =>
        {
            this.player_kart.turning_right = false
        })
    },

    engine_start : function()
    {
        this.activate_key_listeners()

        setInterval(()=>
        {
            this.update_karts()
            this.render_global_view()
            this.render_kart_on_game_view()
        }, 16)
    }
}