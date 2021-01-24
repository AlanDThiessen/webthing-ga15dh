/******************************************************************************
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Alan Thiessen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 ******************************************************************************/

'use strict';

const Coruscate = require('coruscate');
const {
    Property,
    SingleThing,
    Thing,
    Value,
    WebThingServer,
} = require('webthing');


class GA15DH extends Thing {
    constructor() {
        super('urn:dev:ops:asus-ga15dh', 'Asus GA15DH', ["OnOffSwitch"], 'Asus ROG Strix GA15DH LEDs');
        this.config = {
            mode: 'Static',
            speed: Coruscate.speeds.Medium,
            color1: '#ff0000',
            color2: '#0000ff',
            direction: 'Right',
            zone: 0
        }
        this.device = Coruscate.Coruscate(this.config);
        this.device.Update();

        this.addProperty(
            new Property(this,
                'On',
                new Value(true, this.SetOn.bind(this)),
                {
                    '@type': 'OnOffProperty',
                    'type': 'boolean',
                    'title': 'On',
                    'description': "Turn On/Off"
                }));

        this.addProperty(
            new Property(this,
                'Mode',
                new Value(this.config.mode, this.SetMode.bind(this)),
                {
                    'type': 'string',
                    'title': 'Mode',
                    'enum': Object.keys(Coruscate.modes)
                }));

        this.addProperty(
            new Property(this,
                'Primary Color',
                new Value(this.config.color1, this.SetColor1.bind(this)),
                {
                    '@type': 'ColorProperty',
                    'type': 'string',
                    'title': 'Primary Color'
                }));

        this.addProperty(
            new Property(this,
                'Secondary Color',
                new Value(this.config.color2, this.SetColor2.bind(this)),
                {
                    '@type': 'ColorProperty',
                    'type': 'string',
                    'title': 'Secondary Color'
                }));

        this.addProperty(
            new Property(this,
                'Speed',
                new Value(this.config.speed, this.SetSpeed.bind(this)),
                {
                    '@type': 'LevelProperty',
                    'type': 'integer',
                    'title': 'Speed',
                    'minimum': Coruscate.speeds.Slow,
                    'maximum': Coruscate.speeds.Fast
                }));

        this.addProperty(
            new Property(this,
                'Direction',
                new Value(this.config.direction, this.SetDirection.bind(this)),
                {
                    'type': 'string',
                    'title': 'Direction',
                    'enum': Object.keys(Coruscate.directions)
                }));
    }

    SetOn(on) {
        if(on) {
            this.device.On();
        }
        else {
            this.device.Off();
        }
    }

    SetMode(mode) {
        this.config.mode = mode;
        this.device.SetMode(this.config.mode);
    }

    SetColor1(color) {
        this.config.color1 = color;
        this.device.SetColor(this.config.color1, this.config.color2);
    }

    SetColor2(color) {
        this.config.color2 = color;
        this.device.SetColor(this.config.color1, this.config.color2);
    }

    SetSpeed(speed) {
        this.config.speed = speed;
        this.device.SetSpeed(this.config.speed);
    }

    SetDirection(dir) {
        this.config.direction = dir;
        this.device.SetDirection(this.config.direction);
    }
}


function runServer() {
    const ga15dh = new GA15DH();

    const server = new WebThingServer(new SingleThing(ga15dh), 9001);

    process.on('SIGINT', () => {
        server.stop().then(() => process.exit()).catch(() => process.exit());
    });

    server.start().catch(console.error);
}

runServer();

