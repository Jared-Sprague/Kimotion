import FishSprite from "mods/fish/FishSprite";
import { randomIntInclusive } from "mods/fish/utils";
import { BLUE } from "mods/fish/consts";

export default class BlueFishSprite extends FishSprite {
    constructor() {
        super();

        this.type = BLUE;

        this.max_outer_x = 600;
        this.min_outer_x = 0;

        this.img_height = 222;
        this.img_width = 299;

        this.max_speed = 6;
        this.min_speed = 2;

        this.coin_num = 1;  // how many coins does the fish release
    }
}
