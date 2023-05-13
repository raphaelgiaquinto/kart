async function main()
{
    /**
     * Setting up the canvases used for the rendering
     */
    Engine.use_canvas("canvas", "view")
    
    /**
     * Loading map
     */
    Engine.map = await ImageLoader.load("map.png")

    /**
     * Loading collisions map
     */
    Engine.load_collisions_map(await ImageLoader.load("collisions_map.png"))
    
    /**
     * Setting up player kart with it position of the map and the sprite used rendered on the projected player view
     */
    Engine.player_kart = new Kart(70, 350, 15, 30, await ImageLoader.load("enemy.png")) 

    /**
     * Activate basics inputs (Z to go forward, D to turn right, Q to turn left, S to go back).
     * Keys can be set by using Engine.keys.KEY = value.
     * Example: Engine.keys.FORWARD = 'w'.
     * See Engine.keys
     */
    Engine.activate_base_inputs_keys()

    /**
     * Adding new collision detection
     * When the pixel is black (see collisions_map.png),
     * return true
     */
    Engine.add_collision_detection((pixel) => 
    {
        return pixel[0] == 0 && pixel[1] == 0 && pixel[2] == 0
    })

    /**
     * Start engine
     */
    Engine.engine_start()
}


main()