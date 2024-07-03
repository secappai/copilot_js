/* Nous allons devoir coder un script pour décoder des chaînes de caractères*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char decalage(char c, int n){
    if (c >= 'a' && c <= 'z'){
        return 'a' + (c - 'a' + n) % 26;
    }
    if (c >= 'A' && c <= 'Z'){
        return 'A' + (c - 'A' + n) % 26;
    }
    return c;
}

char * decode(char *s, int n){
    for (int i = 0; i < strlen(s); i++){
        s[i] = decalage(s[i], n);
    }
}

char * alterne (char *s, int n) {
    // la fonction retourne une chaîne de caractères qui contient les caractères en position k*n pour k entier positif
    char *res = malloc(strlen(s) + 1);
    int j = 0;
    for (int i = 0; i < strlen(s); i++){
        if (i % n == 0){
            res[j] = s[i];
            j++;
        }
    }
    res[j] = '\0';
    return res;
}

// peux tu ecrire une fonction qui supprime les voyelles d'une chaine de caractères
char * sans_voyelles(char *s){
    char *res = malloc(strlen(s) + 1);
    int j = 0;
    for (int i = 0; i < strlen(s); i++){
        if (s[i] != 'a' && s[i] != 'e' && s[i] != 'i' && s[i] != 'o' && s[i] != 'u' && s[i] != 'y' && s[i] != 'A' && s[i] != 'E' && s[i] != 'I' && s[i] != 'O' && s[i] != 'U' && s[i] != 'Y'){
            res[j] = s[i];
            j++;
        }
    }
    res[j] = '\0';
    return res;
}

int main(){
    char s[] = "Bonjour";
    decode(s, 3);
    printf("%s\n", s);
    char *res = alterne(s, 2);
    printf("%s\n", res);
    free(res);
    char s2[] = "Bonjour";
    char *res2 = sans_voyelles(s2);
    printf("%s\n", res2);
    return 0;
}