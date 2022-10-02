; ****************************************
; Solution to Project Euler Q2 using 8-bit
; AVR assembly. The solution was directly
; written in assembly.
;
; This solution is by (github user)
; bg-thompson.
; The solution was obtained after 311
; cycles.
;
; ****************************************
; Code run 2021.04.28 using an emulated
; ATMega328P chip in Microchip studio
; version 7.0.2542.
;
; ****************************************
; PEQ2: Calculate the sum of even 
; Fibonacci numbers below 8,000,000.
;
; Solution:
; Since log_2(8,000,000) is approx 21.9,
; we need to use (at least) 24-bit
; registers. Since the sequence is 
; exponential, 24-bits should be enough,
; even for the sum.
;
; Every third number in the number is
; sequence, so we can store consecutive
; terms in the sequence in R0, R1, RE.
;
; These are updated by
; RE = R0 + R1, R0 = R1 + RE,
; R1 = RE + R0
;
; The rest is straightforward.
;
.def	R0L=r16
.def	R0M=r17
.def	R0H=r18
.def	R1L=r19
.def	R1M=r20
.def	R1H=r21
.def	REL=r22
.def	REM=r23
.def	REH=r24
.def	RTL=r25		; RTotal
.def	RTM=r26
.def	RTH=r27
.def	UPBL=r28	; Upperbound
.def	UPBM=r29
.def	UPBH=r30
;
; ****************************************
; Macros
;
.macro tfmov	; (twentyfourmov)
; 0,1,2 <- 3,4,5
mov @0, @3 
mov @1, @4
mov @2, @5
.endmacro

.macro tfadd	; (twentyfourmov)
; 0,1,2 += 3,4,5
add @0, @3
adc @1, @4
adc @2, @5
.endmacro
;
; ****************************************
; Code segment
;
;
.cseg	; Start code segment
init:
	; R0 = R1 = 1, R2 = RT = 0	
	ldi R0L, 0x01
	clr R0M	
	clr R0H	
	ldi R1L, 0x01
	clr R1M
	clr R1H
	clr REL
	clr REM
	clr REH
	clr RTL
	clr RTM
	clr RTH
	; Initialize upper bound
	; 8,000,000 = 0x7a1200
	ldi UPBL, 0x00
	ldi UPBM, 0x12
	ldi UPBH, 0x7a
loop:
	; RE = R1, RE += R0	
	tfmov REL, REM, REH, R1L, R1M, R1H
	tfadd REL, REM, REH, R0L, R0M, R0H
	; Check if 4,000,000 =< RE
	cp REH, UPBH
	brlo compute	; REH < UPBH
	; Otherwise REH >= UPBH
	cp REH, UPBH
	brne end		; REH > UPBH
	; Otherwise UPBH = REH
	cp REM, UPBM
	brlo compute	; REM < UPBM
	cp REM, UPBM
	brne end		; REM > UPBM
	; Otherwise REM = UPBM
	cp REL, UPBL
	brsh end	; REL >= UPBL
	; Otherwise RE < UPB, so 
	; add RE to RT and continue
	; computing Fibonacci numbers!
compute:
	; RT += RE
	tfadd RTL, RTM, RTH, REL, REM, REH
	; R0 = RE, R0 += R1
	tfmov R0L, R0M, R0H, REL, REM, REH
	tfadd R0L, R0M, R0H, R1L, R1M, R1H
	; R1 = R0, R0 += RE
	tfmov R1L, R1M, R1H, R0L, R0M, R0H
	tfadd R1L, R1M, R1H, REL, REM, REH
	rjmp loop
end:
	rjmp end
;
; ****************************************
;
; A breakpoint was set on "rjmp end" and
; the program was run in the emulator.
;
; The breakpoint was reached after 311
; cycles.
; The value in RT 0x(r27)(r26)(r25) was
; 0x466664 = 4613732.
;
; This agrees with a published solution
; for PEQ2.
;
