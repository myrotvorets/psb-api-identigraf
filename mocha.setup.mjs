import { register } from 'node:module';
import { pathToFileURL } from 'node:url'; 
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

register('ts-node/esm', pathToFileURL('./'));

use(chaiAsPromised);
