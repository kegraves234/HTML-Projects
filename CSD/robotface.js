function setup() {
    createCanvas(400, 400);
    background("lightblue");
    strokeWeight(3);

    // Head
    fill(color(random(100, 255), random(0, 100), random(100, 255)));
    beginShape();
    vertex(75, 50);
    vertex(325, 50);
    vertex(325, 200);
    vertex(350, 200);
    vertex(350, 325);
    vertex(50, 325);
    vertex(50, 200);
    vertex(75, 200);
    endShape(CLOSE);

    // Ears
    fill(color(random(200, 255), random(0, 100), random(200, 255)));
    let earY1 = random(65, 125);
    let earY2 = random(65, 125);
    rect(325, earY1, 25, 55); 
    rect(350, earY1 + 10, 15, 35); 
    rect(50, earY2, 25, 55);  
    rect(35, earY2 + 10, 15, 35);  

    // Eyes
    fill(0);
    ellipse(95, 65, 15, 15);
    ellipse(305, 65, 15, 15);
    fill("white");
    ellipse(145, 125, 50, 50);
    ellipse(255, 125, 50, 50);
    fill(color(random(0, 255), random(0, 255), random(0, 255)));
    ellipse(random(127, 162), 125, 15, 15);
    ellipse(random(235, 273), 125, 15, 15);

    // Mouth
    fill("white");
    let mouthx = random(60, 120);
    rect(mouthx, 225, 220, 60);
    line(mouthx, 255, mouthx + 220, 255); 
    line(mouthx + 110, 225, mouthx + 110, 285); 
    line(mouthx + 70, 225, mouthx + 70, 285); 
    line(mouthx + 30, 225, mouthx + 30, 285); 
    line(mouthx + 150, 225, mouthx + 150, 285); 
    line(mouthx + 190, 225, mouthx + 190, 285); 

    // Antennas
    noFill();
    for (let i = 0; i < 4; i++) {
        let antX = random(110, 290);
        arc(antX, 23, 40, 80, 0, PI);
        arc(antX + 20, 15, 15, 15, radians(200), radians(500));
    }
}
