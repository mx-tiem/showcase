import { Routes } from '@angular/router';
import { SelectTask } from './select-task/select-task';
import { Pokemons } from './pokemons/pokemons';
import { Widgets } from './widgets/widgets';

export const routes: Routes = [
  { path: '', redirectTo: 'select-task', pathMatch: 'full'},
  { path: 'select-task', component: SelectTask },
  { path: 'widgets', component: Widgets, children: [
    { path: 'new', component: Widgets },
  ]},
  { path: 'pokemons', component: Pokemons, children: [
    { path: 'show/:id', component: Pokemons },
  ]},
  { path: '**', redirectTo: 'select-task' },
];
