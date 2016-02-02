## File di configurazione per Apache

* Il file "010-raschietto.conf" viene generato a partire dal template in "templates/site-template.conf"
* Il file renameme.htaccess serve solo per il server dell'università

### Installazione su server locale
Se l'installazione è su una macchina privata, copiare il file "010-raschietto.conf" nella directory "sites-available" di apache (normalmente "/etc/apache2/sites-available/") ed attivare il sito con 

```bash
$ sudo a2ensite 010-raschietto
```

quindi riavviare apache. In alternativa eseguire come root lo script "install.sh".

**ATTENZIONE**
Se si usa lo script install.sh, controllare che non faccia danni ad un'eventuale configurazione preesistente di apache.

### Installazione su server università
Spostare le cartelle a mano!! dopodichè rinominare il file renameme.htacces come .htaccess (ma và?) e quindi copiarlo nella document root del server dell'università


