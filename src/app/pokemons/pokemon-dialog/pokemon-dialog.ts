import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';

interface PokemonFullDetailInterface {
  id: number,
  name: string,
  height: number,
  weight: number,
  type: string,
  images: string[],
  stats: {[key: string]: number, effort: number}[],
  moves: string[],
  abilities: string[],
}

@Component({
  selector: 'app-pokemon-dialog',
  imports: [CarouselModule, RouterModule, HttpClientModule],
  templateUrl: './pokemon-dialog.html',
  styleUrl: './pokemon-dialog.scss'
})
export class PokemonDialog implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  pokemon!: PokemonFullDetailInterface

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: [ 'prev', 'next' ]
  }

  constructor(private http: HttpClient){}

  ngOnInit(): void {
    this.getPokemonDetails()
  }

  getPokemonDetails() {
    this.http.get(this.data.pokemon.url).subscribe((responseData: any) => {
      this.pokemon = {
        id: responseData.id,
        name: this.upperCaseString(responseData.name),
        height: responseData.height,
        weight: responseData.weight,
        type: responseData.types.map((type: any) => type.type).map((type: any) => this.upperCaseString(type.name)).join(', '),
        images: Object.values(responseData.sprites).filter(spriteValue => typeof spriteValue == 'string'),
        abilities: responseData.abilities.map((ability: any) => ability.ability.name),
        moves: responseData.moves.map((move: any) => move.move.name),
        stats: this.parseStats(responseData.stats)
      }
    })
  }

  parseStats(pokemonStats: {base_stat: number, effort: number, stat: {name: string, url: string}}[]) {
    let allStats: any[] = []
    pokemonStats.forEach((stat) => {
      allStats.push({
        [`${stat.stat.name}`]: stat.base_stat,
        effort: stat.effort
      })
    })
    return allStats
  }

  getStatKey(stat: {[key: string]: number}){
    return Object.keys(stat)[0]
  }

  getStatValue(stat: {[key: string]: number}){
    return stat[this.getStatKey(stat)]
  }

  upperCaseString(someString: string) {
    return someString[0].toUpperCase() + someString.slice(1);
  }
}
