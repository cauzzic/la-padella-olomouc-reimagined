import { describe, it, expect } from 'vitest';
import { dishes, weeklyMenu } from '@/data/restaurant';
describe('Independent frontend demo content',()=>{
 it('offers literal demo dishes without needing a remote content source',()=>{expect(dishes.length).toBeGreaterThan(10);expect(dishes.find(d=>d.id==='margherita')?.price).toBe(245)});
 it('includes every weekday in the demo week',()=>{expect(weeklyMenu.map(d=>d.day)).toEqual(['Pondělí','Úterý','Středa','Čtvrtek','Pátek'])});
});
