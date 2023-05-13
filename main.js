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
     * Setting up player kart with it position of the map and the sprite used rendered on the projected player view
     */
    Engine.player_kart = new Kart(70, 350, 15, 30, await ImageLoader.load("kart.png")) 

    /**
     * Activate basics inputs (Z to ride, D to turn right, Q to turn left)
     */
    Engine.activate_base_inputs_keys()

    /**
     * Start engine
     */
    Engine.engine_start()
}


main()