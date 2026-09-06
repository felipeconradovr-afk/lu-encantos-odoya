import {defineConfig}from'@playwright/test';
export default defineConfig({testDir:'./tests',fullyParallel:false,workers:1,timeout:45000,reporter:'list',use:{baseURL:'http://localhost:3000',browserName:'chromium',channel:'chrome',headless:true,viewport:{width:1280,height:900},reducedMotion:'reduce',screenshot:'only-on-failure'}});
