import type { DailyJournalDocument } from "./DailyJournalDocument";
import type { DailyJournalTextBoxItem } from "./DailyJournalItem";

interface TourData {
  document: DailyJournalDocument;
  images: FileList;
}

export function createTourData(): TourData {
  const tourData: TourData = {
    document: createTourDailyJournalDocument(),
    images: createTourImages(),
  };
  return tourData;
}

function createTourDailyJournalDocument(): DailyJournalDocument {
  const dateString = new Date().toLocaleDateString("default", { year: "numeric", month: "long", day: "numeric" });
  const headerTextBox: DailyJournalTextBoxItem = {
    type: "textBox",
    name: "header",
    width: 768,
    height: 100,
    data: {
      style: {
        width: 800,
        borderWidth: 10,
        borderStyle: "solid",
        borderRadius: 5,
        borderColor: "#000000",
        fontFamily: "Alice",
        fontSize: "30pt",
        color: "#000000",
        backgroundColor: "#ffffff",
        paddingBottom: 4,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
      },
      richText: {
        type: "root",
        children: [
          {
            type: "layoutContainer",
            children: [
              {
                type: "layoutItem",
                style: {
                  textAlign: "center",
                },
                children: [
                  {
                    type: "paragraph",
                    children: [
                      {
                        type: "text",
                        style: {
                          fontWeight: "bold",
                        },
                        text: "Daily Journal",
                      },
                    ],
                    style: {
                      textAlign: "center",
                    },
                  },
                ],
              },
              {
                type: "layoutItem",
                style: {
                  textAlign: "center",
                },
                children: [
                  {
                    type: "paragraph",
                    children: [
                      {
                        type: "text",
                        style: {
                          fontWeight: "bold",
                        },
                        text: dateString,
                      },
                    ],
                    style: {
                      textAlign: "center",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };
  const document: DailyJournalDocument = {
    style: {
      width: "8.5in",
      height: "11in",
      position: "relative",
    },
    itemBoxes: [
      {
        key: "header",
        item: {
          name: "header",
          type: "textBox",
          data: {
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#000000",
              borderRadius: 5,
              borderStyle: "solid",
              borderWidth: 10,
            },
          },
          width: 768,
          height: 100,
        },
        originalItem: headerTextBox,
        style: {
          width: "8in",
          height: "1.04167in",
          position: "absolute",
          left: "0.25in",
          top: "0.25in",
        },
      },
      {
        key: "header-title",
        item: {
          name: "header-title",
          type: "textBox",
          data: {
            style: {
              fontFamily: "Alice",
              fontSize: "30pt",
              color: "#000000",
              backgroundColor: "#ffffff",
              alignContent: "center",
            },
            richText: {
              type: "root",
              style: {
                textAlign: "center",
                alignContent: "center",
              },
              children: [
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "text",
                      style: {
                        fontWeight: "bold",
                      },
                      text: "Daily Journal",
                    },
                  ],
                  style: {
                    textAlign: "center",
                  },
                },
              ],
            },
          },
          width: 384,
          height: 100,
        },
        originalItem: headerTextBox,
        style: {
          width: "3.65625in",
          height: "0.625in",
          position: "absolute",
          left: "0.39583in",
          top: "0.45833in",
        },
      },
      {
        key: "header-date",
        item: {
          name: "header-date",
          type: "textBox",
          data: {
            style: {
              fontFamily: "Alice",
              fontSize: "30pt",
              color: "#000000",
              backgroundColor: "#ffffff",
              alignContent: "center",
            },
            richText: {
              type: "root",
              style: {
                textAlign: "center",
                alignContent: "center",
              },
              children: [
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "text",
                      style: {
                        fontWeight: "bold",
                      },
                      text: dateString,
                    },
                  ],
                  style: {
                    textAlign: "center",
                  },
                },
              ],
            },
          },
          width: 384,
          height: 100,
        },
        originalItem: headerTextBox,
        style: {
          width: "3.65625in",
          height: "0.625in",
          position: "absolute",
          left: "4.10417in",
          top: "0.45833in",
        },
      },
      {
        key: "image-tour1.png",
        item: {
          type: "image",
          name: "tour1.png",
          width: 844,
          height: 832,
        },
        style: {
          width: "3.46875in",
          height: "3.42708in",
          position: "absolute",
          left: "0.25in",
          top: "1.34375in",
        },
      },
      {
        key: "image-tour2.png",
        item: {
          type: "image",
          name: "tour2.png",
          width: 399,
          height: 329,
        },
        style: {
          width: "4.15625in",
          height: "3.42708in",
          position: "absolute",
          left: "3.77083in",
          top: "1.34375in",
        },
      },
      {
        key: "image-tour3.png",
        item: {
          type: "image",
          name: "tour3.png",
          width: 907,
          height: 564,
        },
        style: {
          width: "4.79167in",
          height: "2.97917in",
          position: "absolute",
          left: "0.25in",
          top: "4.82292in",
        },
      },
      {
        key: "image-tour4.png",
        item: {
          type: "image",
          name: "tour4.png",
          width: 422,
          height: 407,
        },
        style: {
          width: "3.09375in",
          height: "2.97917in",
          position: "absolute",
          left: "5.09375in",
          top: "4.82292in",
        },
      },
    ],
    imageNames: ["tour1.png", "tour2.png", "tour3.png", "tour4.png"],
    fontFamilyNames: ["Alice"],
  };
  return document;
}

function createTourImages(): FileList {
  function base64ToFile(base64: string, filename: string, mime = "image/png"): File {
    const byteString = atob(base64);
    const ab = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ab[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: mime });
  }

  const dt = new DataTransfer();
  dt.items.add(
    base64ToFile(
      "iVBORw0KGgoAAAANSUhEUgAAACAAAAAXCAYAAABqBU3hAAAEPElEQVRIS41W22rUUBQ9ubT+hD744osUQRREvFSwUO9IHxRBxVdRUaz/3kkyieuydyaZItjpIdNOJnvttdZe51Qvz69NVVWXpm5K3TS66n3VlKrUWHzV+BurbkvbtOWgPdBq21b3VlVVpmksw3Yofd+VrtuUDRavXb/B//uyxWfjtMV9UykVVvxUL34TAEpEYRXnUvFcAAFA/IwA2n8AYJG+71V0010IAAH1AwCMg0BOZUTpBYBnP68KQBZ29yjMNdW42Rzgjv8AsEUxM5DddwBABkYxQAAsThZMQXX6wwBMsYubftwx8S68w1UyJAMNJDiABGCjgWyWYBLNA7qdi3fs3gC2I+lPBqI4Hl+dfrME7NjF3b2KaxFw+iAkIADoTykMALcIgBnoUZgysHtKQG+MkGDcp58Ann+7DgDsM2gngOgegAu/I9+EERsakR4ILzQ1v5cMhARhROufAMAAHmYJ8LyU4PX3GxP/EgvhenbMogQwjXgzmg2yIwBRnFdOjhjAfTMDAUAMLAGEB7K4gJz9PDKAeMkdBIAHQjZdxQQByAd7AJKBkWMIBoJ2juHMwDCU7eQpoKbkQASQ+fe/70ph/Ybp3Dka3wJEAEgjkoGGDMSqAYBfVg4MBsDOcxLEAAHQA8spyBz4+OeBRBEIdZ/UrwGYAWeEi9uAmhh8bSQDKMQcmENIQRRTAHbmIBIL4YXP58eXASwlAAv0Q0Em8LVjgACYhGSAAKYA0AnADgQZ6MtABnIU/UCb8dOvJ3sAzAIaKkjO0D8AKA3dPSdBJuTIggIysAUDon9DEBcBIpIwskAyJABO14evj1cAKMVEL8D5OQnOARQnAGbAEgAkkQf2JFgysPIB7nMgmdnq7Mv9MGHOwTKEMow4ggRAAzKEDr0Z4b3GEC9KMO8FCKIlgC6NqECiF9gzgQDAy3d3dmOoEMogMpDckASgzu4JwCA4lqsgggmZhBumYZgw09CJSAAhAwGcvLnlnIs43u2ABiPzoXiN7lul4GE5VPFDvXcU874SQZRbMgF4JGcJAIB7Av1CH/BVHZ/eXO0F1Fr7AYvb96F/0k8JrswMcBJmAAsf+FxgAJyCnlmwAsBQQuuPTgwgN6E8iPg8EIeS0F/ub5J+M8BJSADKAp0JggXKEeeBDCPGtRmgEQHg+ORowUCeBfI0xDOBw4YScAQPAICFLQGyAP/TKCoLnIYZSDQfg0k5AAZmD+A+GRGrenp6e287NuVrLxhEU9n5zgB27zAiAD5PWYAOEwBPQjMAnhXwmT2AnZERTw88e3VPXt+dB2wqn4Z8NRiHECchpVAQBQOXAEQsW38wQP21YgooAyV4/fbhCoCKBwMawwCifSBkYBaoewHKMXQczwywKL0g+g2ADIzBgqaAErw9w16wNGEcTDh+Kj6fC3lQdcG5uEA4iMzAGgCdP9ADcVRbSRAA/gKw/db4pXNnPQAAAABJRU5ErkJggg==",
      "tour1.png",
    ),
  );
  dt.items.add(
    base64ToFile(
      "iVBORw0KGgoAAAANSUhEUgAAACAAAAAXCAYAAABqBU3hAAAE80lEQVRIS12Wy44bVRRFb1XZZXf3iEF4iEQCCSJFAQkRwQSRSQTKhJfCBCaBH2DKiAHwy+l2vYu99rm33CbyTdlu22edvc+jqkff/Ls2TZ3a/T4dDvt0dWjTsd3r9S61uzrt6io1Onr46OF/67qmeVnTNC1p0OnHuA5TSuNSpyk1aU67tFScvZ43aVqrNC06c3xXj1R9+PIMcFRwAwjkIID9rkn7JgB0CQBDVAJIATDnwALopzUN+nEA5vUMMAuC19MqsEWAAOgs+pHqyXf/SIEmtcq6AABxaHeCAAAVakEIwEooPBQCIAMARgKjggH0HllmAAeXErOCj3qf4BcAz179ve6UKRYcj226Ph4uVLANQBhEAIIBAilQYSKgVYjsA0CZki2BS3AA9LcCy3dQsHr+61/rLitwpeAAcFDjaBWworYdASEAnaqqEUE/AkBkFf5zQoFQoUmjg1eG7KkTkYwiN8DL138a4NDKf4Jf3YeIWrAV1IMhmkTR1gaoZAOFFQDOUIECABXC90GKOLjoOn2oFykQ87Kk6sff/ggLVAPO/uoYR3ZEQYYK0RVA7ATQWAXKEQAyieBFgbCAYgRmEBSZd/Ln1I+p6yfBTCrEOVU/v/7dRXgQAArcZICbq8uOoChbBQcAYAOgAnVgG6K6XWgo4OBkH9KfHHxKd91giH4Y9R0BvPrlJ1mgOZAtuMGCrAAqMBOiFmI27GUHNtR1427YFHB7xaELztmn1AHg4GO6PQ269gEg6ur7H57fK0K6AAuog7MFR4YUCuTZgAKNAMKCKMTI/j5AKKG49v5OT26V/e1dL4heNgyhwLcvnsYc0I9T+W5Dt2MMpLMCAEQNuBBtQQDQBaUTigXlSmd0AOTs35w6QwAwTlOqvvryvZVsAIg6yOOYsazXZH703/QZamCzgCLUMML/rQsAyW2YC7DXaysggDeS//ZOAII4oQAWfPbkeqWgaDEASsZb5gpcWnGzILchADM7Ic8Bhgw2xCQsHQDAmi2Q/LagS53ssAIfP0oCqDxs3GpYkTOm/0twnp8tiGnIIFq8D2jDGMkFgNFbIBjRJ3lxd0KFTtdigRR4+ACAJF+TIJJ7vd3X6eCrAARWQAIgJqLbsGxEB9fJhTh7G8ZCYgNGHcxRB+qAkwFoQynwzltpZbQDYAiDSI18ADBIVuMMEAuJaebgBuBgi4JrBC+sYIEwHRlE9L/ngM7Whg8ygFcuVmjv7nTYgq2uRY0NIG9Ib0RqwNnPypL5LjuoAWVNcO4FfB/gabhukxCAYcxz4O0H11ag0X/seyVsAK4G+J8CtkFtWPFhWUAvj0o7AIoCAvCNCEcLKW9CbOjkB/IPGsWeA+8/fJdaUvDVANx4NPVqgL3eAOBATbgwdagBvUcRckMxO3stF41aQ9iCAFgLBDZ4JLMPtAe8jLQLWEYffPRYH2emAaCja6MrNyDUQ6snFwBlDuhLANDLyFk2HIWIBQT3qc+3YyjUl23IOpZ91eNPnlkBA8SCDQAdJa6CrJy194HHcbYAB1yAZE9WgrAVutG4pwAAZxtYyQBjF9tQAE8//zoD6AX3aAJAiQ1AnqBAzIZYzViAagXAwX0EQyFyu6Y7obVWX18AJNu03ZAA8OkXLxCMn3PwahVAVuFSgZiUdANzwLeFKCAvCd5tAIurnqyxIADoBtox7h3Pd0RL+g9sW+QPqUouggAAAABJRU5ErkJggg==",
      "tour2.png",
    ),
  );
  dt.items.add(
    base64ToFile(
      "iVBORw0KGgoAAAANSUhEUgAAACAAAAAXCAYAAABqBU3hAAAFJ0lEQVRIS12WS4/jVBCFy3H8zrMZejQI6A2L2cCGBRJIbJCQEP//h9B5x47N+ere6wl0ZFnp2L5fnVN1rrPf/v5rWiwWtlwuraor69rO1pu17fY72+/3Ou9ts9lY3Ta6JrfH42HX29WOp5Mdj0c/X69XGx6DZfrkuqYoSh2F5XruOE12v9/tfD7b8f1g/7y/2+Fw8O/9vbfslz//CAC6oaoqa9s2AOx2tnsRgM58b5rGH/4YR1/wpIUPAjidAwBgWZZ5IUVZOAQAkwP0AUALvz8B3HsB/PT7rwIINyaA1RqArVe/1Xmt7zUA+cKGUQpcb74wCpwBuN1sfIyW6TlUXpalH3m+NBEYC13OFwEf7DADXFyZ7Ieff3SAHICyskZSr9Yr22wFoMW3OvO9qmtbCMAtQAEqOgFw9geNUmaR574whXBQlE1m/RAAAD7IBkBmCz59fpuSdNxcN7WtVivJvtHiG4FsrOs6K9UfWIXXCQAbLpeL9f2dQt0iFq7rRkflatAXwzDoOvUNALIBK86X2APb71+mhbzLRY93tSpttSCy4z3ntmutrEr3uNfDaEIqAAAYKgxFxPulIhAUxLMHVBPASYoBcDgcBRQB6tfKFXAAGlHkboNU4Oh08J3fVIyqkZxaFAAOYFIDsmDTtFKs9XMFgFSbbaNxUUBKYIk3YfFiDhAmYSlqAcgGVOhWnVePKvg56dPTUACogosAbvebFhi9QVMTY1mrca5lhwOocW807v8AeFa23ANgujB4WEYbGDsW51zqQfw2TaNTX68Xrx7/vQHVACiI7yzuygkAIP4/enYI4Bizw5uQ3hFA9ZUATOoCkGuMBBAaqXbpORdIqQodQAteANDiVwD0EGadkGrkO6qtARBIXTE5AWBWQIsfvQciQPcaFHAVtEihRirUcFTD4vQE/icp7+p4GgoL8H8AQAUUsgi15t6JAFiDRbcUXk894Arsvsl0v4ZFWRAimWlgljkEoDMpSVbgJQrQ+ahwE0DfK4IFD2QCSAq4BYsQ3wB4fPsYKj+SAh++Kya6m3lNgVTQjB4mSjQAVB2AhA0ALEwj3uUrM04TA9A+T0/qAZ8CjS45kAA8QaMFH98qFHQPPA+kABWHRAuRynSwCACEzk0LIz8wPJzfuK59soA9ZR7DgRxQEv4HQDmABR/fagdAAaqka6nY8/wJAHUAIAduUQV2M2zht1KbjyvQkR0aYeUAzwDuQXhhQUzC07MCr98GgKQAjeh5oAcmACyhPyYDYPDK75p/KvA9QL8lBXwMdTBBPAMAGvU5CVMQuQIfPkULnEE2zArIhqiAT4HA2FmQnNHrBYEa46gMcIDQhDMA4xv3AqIaC8gBkhAF5jHcfV0GBRKAJ6ICKSpAH3wBMC348Mo5kJZsSAo4gLzn8PxwAO2GrgC7YZwC7Ql89wla75YzAFcHBQBAgTAJ/naj//EHADZQfQCYXB2AiXAWpxlTfBMSWEDFVO5vUTqwxC1o1rkiPrXBcxZEADUS6QgUgJM3IgCD28G9SQHfSeW9A/A+EF9IfP+IFhyVhFhBjgwoUDUEkb83hDSUBbycBAXCKDqAHsbvSM72+kABnVGAHuCaRsGFDRy17ktvRPSLA/gY6jWObRwLNJ5ZUQHAPucFRoCwKbEzzgCEkQOERkQBMv6LBXoXUNUBQAmqe5eyk99ngLgZJYBhUAYuS197/gsKxHeDmIQeRvofU4ICVI7/roA+eXwXZPNhcTYlQohM8XdC4nu24FkBs38Br122QcyXYnQAAAAASUVORK5CYII=",
      "tour3.png",
    ),
  );
  dt.items.add(
    base64ToFile(
      "iVBORw0KGgoAAAANSUhEUgAAACAAAAAXCAYAAABqBU3hAAAE/ElEQVRIS2WWz4/bRBTHx3ES27Gd7GavHDgg9cAFkBAHEAUJkKhEe0MLpRJFlQqCrRCg3opU9Y/urmNn+H7em/GmpZV3Esfz3ud9349x8fLlq7iuqtD3fTg/34f9xUXY7/fh7Ow8tF0XqqoJ5XIZYijCdIzhME5hOEzhRtfA5/F4sur3Sd8nVv98GGP63fcN42g2xmkKR9krXrz4dwbA6f5CEOcXYXe2C23bh6quw6L8PwDOZwgzDAjOWRPIvCZYPXfIAHr2GI+heP78n7heV6HrO0V9ZipwbXcAdAF1ZgCLCAfjmyqgCPfzOiuToOy7nCfVUGBCgSgFrq5+FcA6dJJ7J6eoAEi/3YXNZhNWgluUZYixCOPRATwNgkgqoIRfY1rfStGJY/Yg/6RgDODJk4cCWIV201rUQHB1XR/qBoB1WCxKPRysBsYcTVpn58MYrgVwPRzCjX12IM97gjbnRweQrUgNPHr0IK5XK4uWQtwq8n7bm/x13YSlfiuKhYpQAKmwMOCpyLnFsTt/fXOYPwNyk6U3x35NUpICjCjw4+U3cSUFmqaxNHSCYN1IkUr5pwMMAAX0BwgzJCNjhlCUOM8Ar2+GWQkD4NI+ZCdy7OAcm8UPl1/ElaIk2rZt5bwNG62NvlOApfKfFYAaA+TO0pEUsVoAQNHj3FUYLBUAeOTumFTi2ACkavHTw7txqShrtRtpAKLRWle18r8KpfIvAnuYjdnAUXckgpTw2UC+TQUArpMCqVBddu3Fhi4ZtLlinx4//tIAkJs0AMFaqfqXq6UVYHECwCaDSUaICgd0xawC0UsFoBhGpMvAcap0AoBNAiuePv3aANbV2hwjPWrwfakBtFj4g3g1egNfOBSXbt6qIKdJftQA6jR6nJPOYiEInHP98exeJM+VHOIYgKquAp1h+edhC9vFmzeaEe8OasNGsKmQC/DgU49+l/bA8vxC+7BpIAA8++u7SKRE7AC1wVCYBuBuU9Egov5LldNIKEoiPdggYg74xcTkPr/bTpzKpkFkgKu/Hwig9BTIORDUw0r5L0+iZ25nFTIAhlDEh5S322DOVQMCYQiNuu8K8KhH73WVFPjtz/uxXJICFWECqBOAkYo9yvlRVlitd2XMpUQf7xCGy2hnxK0CpGCeenP63krBz7/f8zY0ABVhgwooQAt6AqJFweUQ5pb8mZSGmAA4IxQ5KhwGS4kdPNYFidyKz/dZPX3/i3cBThvN/s2GTlAR2gzwAjSAaTSZI3p6Ld52iBWiz/gDChjEYDD55PPplwoqO8fOt5efp0lY60BiEDEHVAc6hJYlKcB4AhAECmDJbXhB8o8a4YglalchA9AJ7M/F6BMw9XMoPrv/SVwtdRjJaasx3GkSAlLXAFAsKKDNKAAAKqQ5xowwCJ6x8ZxeOFIaBqXBZ4HXAu1qh5DVlatRfPjVB6bARvJ3fRt6DiTGcaM6UGoI0IpQRuySk6wAABkCo6dpyCp4HRzmdwDqwQ+idBbc+fR9ex/w47jTcdwbBIowjKwMDMDTYAByBpgD0FakIR1SdlQr97MK1IEAckfkVCSI4t2P7/gLiXK/7bd6KdE7gR3HnAe5EJMCVoQooE6Q7mV5C2DdkNKAMwOwFDiMtaR1hHdTTkXxzkfv2SsZp+BO0e92gtA7QQagEE2BVIgGYAokAP1Ot9zWgc8DoqYdgXgzDd6W1BV18B+1JKvYxDQtoAAAAABJRU5ErkJggg==",
      "tour4.png",
    ),
  );
  return dt.files;
}
