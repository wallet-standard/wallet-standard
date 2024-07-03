#!/usr/bin/env -S node

import process from 'node:process';

import { run } from '../lib/cli.mjs';

run(process.argv);
