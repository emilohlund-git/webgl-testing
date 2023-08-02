import { Vector2D } from "../utilities/Vector2D";
import { Vector3D } from "../utilities/Vector3D";

export class Particle {
  position: Vector2D;
  velocity: Vector2D;
  color: Vector3D;
  size: number;
  timeToLive: number;

  constructor(position: Vector2D, velocity: Vector2D, color: Vector3D, size: number, timeToLive: number) {
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.size = size;
    this.timeToLive = timeToLive;
  }

  update(deltaTime: number) {
    // Update the position based on the velocity and time elapsed
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Decrease the timeToLive
    this.timeToLive -= deltaTime;
  }
}