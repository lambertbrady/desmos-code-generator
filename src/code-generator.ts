const fetch =  require('node-fetch');

// number defining length of code to be generated
const codeLength: number = 6;
// character arrays defining possible characters for use in generating code
const codeCharsIncluded: Array<string> = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const codeCharsExcluded: Array<string> = ['I', 'L', '1', '0', 'O'];

// url of forbidden word list
const codeWordsForbiddenURL: string = 'https://gitcdn.link/repo/ahamburger/8f609c3a57aee907bd426ef66cd6fb1a/raw/1bef175bfa7da130f0f1ea723b625f0f9a0ce5cb/desmos_distracting_words';

export async function fetchWords(url: string): Promise<Array<string>> {
   let text: string;
   try {
      const response = await fetch(url);
      text = await response.text();
   } catch (error) {
      throw new Error(error);
   }
   
   return text.split('\n');
}

export function getArrayDifference<T>(arrayA: T[], arrayB: T[]): T[] {
   return arrayA.filter(element => !arrayB.includes(element));
}

export function getRandomElement<T>(array: T[]): T {
   return array[Math.floor(Math.random() * array.length)];
}

export function getRandomArray<T>(length: number, charList: T[]): T[] {
   if (charList.length <= 1) {
      throw new Error('character list must have at least one element');
   }
   // convert charList to Set, which removes any duplicate values, and then convert back to Array
   const charsUnique = [...new Set(charList)];
   // create array with specified length and fill with random characters from list, then convert to string
   return [...Array(length)].map(() => getRandomElement(charsUnique));
}

export function containsWord(testStr: string, word: string, matchCase: boolean = false): boolean {
   if (testStr.length === 0 || word.length === 0) {
      throw new Error("Each argument must be string with length greater than 0");
   }
   // match 0 or more instances of any character
   const matcher: string = '.*';
   // pattern for 'test' is '.*t.*e.*s.*t.*'
   const pattern: string = matcher + Array.from(word).join(matcher) + matcher;
   // use case instensitive flag when matchCase is false
   const flag: string = (matchCase) ? 'g' : 'gi';
   return new RegExp(pattern, flag).test(testStr);
}

export function genCode(codeLength: number, charList: Array<string>, wordList: Array<string>): string {
   if (!Number.isInteger(codeLength) || codeLength <= 0) {
      throw new Error('First argument must be an integer greater than 0');
   }
   // convert random array to string
   const code: string = getRandomArray(codeLength, charList).join('');
   // ignore any word whose length is greater than codeLength, then set match to true if any word is contained in code string
   const match: boolean = wordList
      .filter(word => word.length <= codeLength)
      .reduce((isMatch: boolean, word) => {
         if (isMatch) return isMatch;
         return containsWord(code, word);
      }, false);
   // generate a new code if any match is found, otherwise return successful code
   return (match) ? genCode(codeLength, charList, wordList) : code;
}

const charsPossible = getArrayDifference(codeCharsIncluded, codeCharsExcluded);
fetchWords(codeWordsForbiddenURL).then(words => {
   const code = genCode(codeLength, charsPossible, words);
   console.log(`//////////////\n/// ${code} ///\n//////////////`);
});