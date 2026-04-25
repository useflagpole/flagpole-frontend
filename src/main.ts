import { mount } from 'svelte'
import './app.css'
import Router from './Router.svelte'

mount(Router, { target: document.getElementById('app')! })
